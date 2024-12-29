use crate::models::{Feed, NewFeed};
use diesel::prelude::*;
use diesel::ExpressionMethods;
use opml::{Outline, OPML};
use std::collections::HashMap;
use std::fs;

pub async fn opml_file_to_new_feeds(
    file_path: &str,
) -> Result<Vec<NewFeed>, Box<dyn std::error::Error>> {
    let contents = fs::read_to_string(file_path).expect("Should have been able to read the file");
    let document = OPML::from_str(contents.as_str()).unwrap();
    let mut new_feeds: Vec<NewFeed> = Vec::new();

    for outline in document.body.outlines.iter() {
        if let Some(xml_url) = &outline.xml_url {
            let url = xml_url.clone();

            match crate::utils::scrape::scrape_site_feeds(url).await {
                Ok(mut found_feeds) => {
                    if let Some(first_feed) = found_feeds.pop() {
                        new_feeds.push(first_feed);
                    }
                }
                Err(e) => {
                    log::error!(target: "chaski:opml","opml_file_to_new_feeds. Url: {:?} Error: {:?}", xml_url, e);
                }
            }
        } else {
            let folder = &outline.text;

            for outline_in_folder in outline.outlines.iter() {
                if let Some(xml_url) = &outline_in_folder.xml_url {
                    let url = xml_url.clone();

                    match crate::utils::scrape::scrape_site_feeds(url).await {
                        Ok(mut found_feeds) => {
                            if let Some(mut first_feed) = found_feeds.pop() {
                                first_feed.folder = Some(folder.clone());
                                new_feeds.push(first_feed);
                            }
                        }
                        Err(e) => {
                            log::error!(target: "chaski:opml","opml_file_to_new_feeds. Url: {:?} Error: {:?}", xml_url, e);
                        }
                    }
                }
            }
        }
    }

    Ok(new_feeds)
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
