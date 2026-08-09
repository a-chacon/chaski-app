use crate::models::{Feed, NewFeed};
use diesel::prelude::*;
use diesel::ExpressionMethods;
use opml::{Outline, OPML};
use std::collections::HashMap;
use std::fs;
use std::sync::Arc;
use tauri::Emitter;

pub const OPML_IMPORT_PROGRESS_EVENT: &str = "opml://import-progress";

pub struct OmplImportStats {
    pub new_feeds: Option<Vec<NewFeed>>,
    pub detected: usize,
    pub processed: usize,
    pub good: usize,
    pub bad: usize,
}

fn emit_opml_import_progress(
    app_handle: &tauri::AppHandle,
    status: &str,
    message: &str,
    opml_import_stats: OmplImportStats,
    current_url: Option<&str>,
) {
    let payload = serde_json::json!({
        "status": status,
        "message": message,
        "detected": opml_import_stats.detected,
        "processed": opml_import_stats.processed,
        "added": opml_import_stats.good,
        "errors": opml_import_stats.bad,
        "currentUrl": current_url,
    });

    if let Err(err) = app_handle.emit(OPML_IMPORT_PROGRESS_EVENT, payload) {
        log::warn!(target: "chaski:opml", "Failed to emit OPML import progress event: {err:?}");
    }
}

pub async fn opml_file_to_new_feeds(
    file_path: &str,
    app_handle: &tauri::AppHandle,
) -> Result<OmplImportStats, Box<dyn std::error::Error>> {
    let contents = match fs::read_to_string(file_path) {
        Ok(contents) => contents,
        Err(e) => {
            let message = format!("Error reading OPML file: {e}");
            emit_opml_import_progress(
                app_handle,
                "error",
                &message,
                OmplImportStats {
                    new_feeds: None,
                    detected: 0,
                    processed: 0,
                    good: 0,
                    bad: 1,
                },
                None,
            );
            return Err(message.into());
        }
    };

    let document = match OPML::from_str(contents.as_str()) {
        Ok(doc) => doc,
        Err(e) => {
            let message = format!("Invalid OPML file format: {e}");
            log::error!(target: "chaski:opml", "Failed to parse OPML file: {:?}", e);
            emit_opml_import_progress(
                app_handle,
                "error",
                &message,
                OmplImportStats {
                    new_feeds: None,
                    detected: 0,
                    processed: 0,
                    good: 0,
                    bad: 1,
                },
                None,
            );
            return Err(message.into());
        }
    };

    let mut sources: Vec<(String, Option<String>)> = Vec::new();

    for outline in document.body.outlines.iter() {
        if let Some(xml_url) = &outline.xml_url {
            sources.push((xml_url.clone(), None));
        } else {
            let folder = outline.text.clone();
            for outline_in_folder in outline.outlines.iter() {
                if let Some(xml_url) = &outline_in_folder.xml_url {
                    sources.push((xml_url.clone(), Some(folder.clone())));
                }
            }
        }
    }

    let detected = sources.len();

    emit_opml_import_progress(
        app_handle,
        "started",
        "This could take a while, every link is checked, don't close the app.",
        OmplImportStats {
            new_feeds: None,
            detected,
            processed: 0,
            good: 0,
            bad: 0,
        },
        None,
    );

    const MAX_CONCURRENT: usize = 10;
    let semaphore = Arc::new(tokio::sync::Semaphore::new(MAX_CONCURRENT));

    let mut join_set: tokio::task::JoinSet<(String, Option<String>, Result<Vec<NewFeed>, String>)> =
        tokio::task::JoinSet::new();

    for (url, folder) in sources.into_iter() {
        let sem = semaphore.clone();
        join_set.spawn(async move {
            let _permit = sem.acquire().await.unwrap();
            let result = crate::utils::scrape::scrape_site_feeds(url.clone())
                .await
                .map_err(|e| e.to_string());
            (url, folder, result)
        });
    }

    let mut new_feeds: Vec<NewFeed> = Vec::new();
    let mut good = 0usize;
    let mut bad = 0usize;
    let mut processed = 0usize;

    while let Some(task_result) = join_set.join_next().await {
        processed += 1;

        let (url, current_url_opt) = match task_result {
            Ok((url, folder, Ok(mut found_feeds))) => {
                if let Some(mut first_feed) = found_feeds.pop() {
                    first_feed.folder = folder;
                    new_feeds.push(first_feed);
                    good += 1;
                } else {
                    bad += 1;
                    log::warn!(target: "chaski:opml", "No feeds detected from OPML url: {}", url);
                }
                let u = url.clone();
                (url, Some(u))
            }
            Ok((url, _folder, Err(e))) => {
                bad += 1;
                log::error!(target: "chaski:opml", "opml_file_to_new_feeds. Url: {:?} Error: {:?}", url, e);
                let u = url.clone();
                (url, Some(u))
            }
            Err(join_error) => {
                bad += 1;
                log::error!(target: "chaski:opml", "opml_file_to_new_feeds task panicked: {:?}", join_error);
                (String::new(), None)
            }
        };

        emit_opml_import_progress(
            app_handle,
            "progress",
            "Importing OPML feeds...",
            OmplImportStats {
                new_feeds: None,
                detected,
                processed,
                good,
                bad,
            },
            current_url_opt.as_deref(),
        );
        let _ = url;
    }

    emit_opml_import_progress(
        app_handle,
        "finished",
        "OPML import finished.",
        OmplImportStats {
            new_feeds: None,
            detected,
            processed,
            good,
            bad,
        },
        None,
    );

    Ok(OmplImportStats {
        new_feeds: Some(new_feeds),
        detected,
        processed,
        good,
        bad,
    })
}

pub async fn feed_ids_to_opml(
    file_path: &str,
    feed_ids: Vec<i32>,
    app_handle: tauri::AppHandle,
) -> Result<(), Box<dyn std::error::Error>> {
    use crate::db::establish_connection;
    use crate::schema::feeds::dsl::*;

    let conn = &mut establish_connection(&app_handle);

    let feeds_to_include: Vec<Feed> = match feed_ids.len() {
        0 => feeds.load(conn).expect("Error loading feeds"),
        _ => feeds
            .filter(id.eq_any(feed_ids.as_slice()))
            .load(conn)
            .expect("Error loading feeds"),
    };

    let mut grouped_feeds: HashMap<Option<String>, Vec<Feed>> = HashMap::new();
    for feed in feeds_to_include {
        grouped_feeds
            .entry(feed.folder.clone())
            .or_default()
            .push(feed);
    }

    let mut opml_file = OPML::default();

    for (folder_key, feeds_in_folder) in grouped_feeds {
        let mut group = Outline::default();

        match folder_key {
            Some(f) => {
                group.text = f.clone();
                group.title = Some(f);
            }
            None => {
                println!("Folder: None"); // Prints "Folder: None" for feeds with no folder
            }
        }

        for feed in feeds_in_folder {
            println!("Feed ID: {}", feed.id);
            group.add_feed(feed.title.as_str(), feed.link.as_str());
        }
        opml_file.body.outlines.push(group);
    }

    let _ = fs::write(
        ensure_opml_extension(file_path),
        opml_file.to_string().unwrap(),
    );

    Ok(())
}

pub fn ensure_opml_extension(file_path: &str) -> String {
    if !file_path.ends_with(".opml") {
        format!("{}.opml", file_path)
    } else {
        file_path.to_string()
    }
}
