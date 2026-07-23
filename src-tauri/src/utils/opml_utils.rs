use crate::models::{Feed, NewFeed};
use diesel::prelude::*;
use diesel::ExpressionMethods;
use opml::{Outline, OPML};
use std::collections::HashMap;
use std::fs;
use tauri::Emitter;

pub const OPML_IMPORT_PROGRESS_EVENT: &str = "opml://import-progress";

pub struct OpmlImportResult {
    pub new_feeds: Vec<NewFeed>,
    pub detected: usize,
    pub added: usize,
    pub errors: usize,
}

fn emit_opml_import_progress(
    app_handle: &tauri::AppHandle,
    status: &str,
    message: &str,
    detected: usize,
    processed: usize,
    added: usize,
    errors: usize,
    current_url: Option<&str>,
) {
    let payload = serde_json::json!({
        "status": status,
        "message": message,
        "detected": detected,
        "processed": processed,
        "added": added,
        "errors": errors,
        "currentUrl": current_url,
    });

    if let Err(err) = app_handle.emit(OPML_IMPORT_PROGRESS_EVENT, payload) {
        log::warn!(target: "chaski:opml", "Failed to emit OPML import progress event: {err:?}");
    }
}

pub async fn opml_file_to_new_feeds(
    file_path: &str,
    app_handle: &tauri::AppHandle,
) -> Result<OpmlImportResult, Box<dyn std::error::Error>> {
    let contents = match fs::read_to_string(file_path) {
        Ok(contents) => contents,
        Err(e) => {
            let message = format!("Error reading OPML file: {e}");
            emit_opml_import_progress(app_handle, "error", &message, 0, 0, 0, 1, None);
            return Err(message.into());
        }
    };

    let document = match OPML::from_str(contents.as_str()) {
        Ok(doc) => doc,
        Err(e) => {
            let message = format!("Invalid OPML file format: {e}");
            log::error!(target: "chaski:opml", "Failed to parse OPML file: {:?}", e);
            emit_opml_import_progress(app_handle, "error", &message, 0, 0, 0, 1, None);
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
        detected,
        0,
        0,
        0,
        None,
    );

    let mut new_feeds: Vec<NewFeed> = Vec::new();
    let mut added = 0usize;
    let mut errors = 0usize;

    for (index, (url, folder)) in sources.into_iter().enumerate() {
        match crate::utils::scrape::scrape_site_feeds(url.clone()).await {
            Ok(mut found_feeds) => {
                if let Some(mut first_feed) = found_feeds.pop() {
                    first_feed.folder = folder;
                    new_feeds.push(first_feed);
                    added += 1;
                } else {
                    errors += 1;
                    log::warn!(target: "chaski:opml", "No feeds detected from OPML url: {}", url);
                }
            }
            Err(e) => {
                errors += 1;
                log::error!(target: "chaski:opml", "opml_file_to_new_feeds. Url: {:?} Error: {:?}", url, e);
            }
        }

        emit_opml_import_progress(
            app_handle,
            "progress",
            "Importing OPML feeds...",
            detected,
            index + 1,
            added,
            errors,
            Some(url.as_str()),
        );
    }

    emit_opml_import_progress(
        app_handle,
        "finished",
        "OPML import finished.",
        detected,
        detected,
        added,
        errors,
        None,
    );

    Ok(OpmlImportResult {
        new_feeds,
        detected,
        added,
        errors,
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
