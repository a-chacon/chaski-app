use crate::entities::articles::ArticlesFilters;
use crate::models::{Article, Configuration, Feed, Filter, NewFeed, NewFilter};
use crate::utils::notifications::send_notification;
use serde_json::json;
use tauri::command;

#[command]
pub async fn fetch_site_feeds(site_url: String) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command fetch_site_feeds. Params: {site_url:?}");

    let result = crate::utils::scrape::scrape_site_feeds(site_url).await;

    match result {
        Ok(feeds) => match serde_json::to_string(&feeds) {
            Ok(json_string) => Ok(json_string),
            Err(_) => Err(()),
        },
        Err(e) => {
            log::error!(target: "chaski:commands","Error scraping site feeds. Error: {e:?}");
            Err(())
        }
    }
}

#[command]
pub async fn create_feed(new_feed: NewFeed, app_handle: tauri::AppHandle) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command created_feed. Params: {new_feed:?}");

    let created_feed = crate::entities::feeds::create_feed(new_feed, true, app_handle);

    match serde_json::to_string(&created_feed) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn destroy_feed(feed_id: i32, app_handle: tauri::AppHandle) {
    log::debug!(target: "chaski:commands", "Command destroy_feed. Params: {feed_id:?}");

    crate::entities::feeds::destroy(feed_id, app_handle);
}

#[command]
pub async fn list_feeds(app_handle: tauri::AppHandle) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command list_feeds.");

    let results = crate::entities::feeds::index(app_handle);

    match serde_json::to_string(&results) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn list_articles(
    page: i64,
    items: i64,
    filters: Option<ArticlesFilters>,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command list_articles. Page: {page:?}, Items: {items:?}, Filters: {filters:?}");

    let result =
        crate::entities::articles::get_articles_with_feed(page, items, filters, app_handle);

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn list_folders(app_handle: tauri::AppHandle) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command list_folders.");

    let result = crate::entities::feeds::get_folders(app_handle);

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn show_article(article_id: i32, app_handle: tauri::AppHandle) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command show_article. article_id: {article_id:?}");

    let result = crate::entities::articles::show(article_id, app_handle);

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn update_article(
    article_id: i32,
    article: Article,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command update_article. article_id: {article_id:?}");

    let result = crate::entities::articles::update(article_id, article, app_handle);

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn update_feed(
    feed_id: i32,
    feed: Feed,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command update_feed. feed_id: {feed_id:?}, feed: {feed:?}");

    let result = crate::entities::feeds::update(feed_id, feed, app_handle);

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn update_articles_as_read(app_handle: tauri::AppHandle) -> Result<(), ()> {
    log::debug!(target: "chaski:commands","Command update_articles_as_read.");
    crate::entities::articles::update_all_as_read(app_handle);
    Ok(())
}

#[command]
pub async fn update_articles_as_read_by_feed_id(
    feed_id: i32,
    app_handle: tauri::AppHandle,
) -> Result<(), ()> {
    log::debug!(target: "chaski:commands","Command update_articles_as_read_by_feed. feed_id: {feed_id:?}");
    crate::entities::articles::update_all_as_read_by_feed_id(feed_id, app_handle);
    Ok(())
}

#[command]
pub async fn update_articles_as_read_by_folder(
    folder: String,
    app_handle: tauri::AppHandle,
) -> Result<(), ()> {
    log::debug!(target: "chaski:commands","Command update_articles_as_read_by_folder. folder: {folder:?}");
    crate::entities::articles::update_all_as_read_by_folder(folder, app_handle);
    Ok(())
}

#[command]
pub async fn collect_feed_content(
    feed_id: i32,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command collect_feed_content. feed_id: {feed_id:?}");

    let feed = crate::entities::feeds::show(feed_id, app_handle.clone()).unwrap();

    crate::core::jobs::collect_feed_content(&feed, app_handle.clone()).await;

    Ok(String::from("Ok"))
}

#[command]
pub async fn full_text_search(text: String, app_handle: tauri::AppHandle) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command full_text_search. text: {text:?}");

    let articles = crate::entities::articles::full_text_search(&text, app_handle.clone()).await;
    let feeds = crate::entities::feeds::full_text_search(&text, app_handle.clone()).await;

    let response = json!({
        "articles": articles,
        "feeds": feeds,
    });

    match serde_json::to_string(&response) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn index_filters(
    filter_filters: Option<crate::entities::filters::FilterFilters>,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command list_filters. filter_filters: {filter_filters:?}");

    let filters = crate::entities::filters::index(filter_filters, app_handle);

    match serde_json::to_string(&filters) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn create_filter(
    new_filter: NewFilter,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command create_filter. new_filter: {new_filter:?}");

    let created_filter = crate::entities::filters::create(new_filter, app_handle);

    match serde_json::to_string(&created_filter) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn update_filter(
    filter_id: i32,
    filter: Filter,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command update_filter. filter_id: {filter_id:?}, filter: {filter:?}");

    let updated_filter = crate::entities::filters::update(filter_id, filter, app_handle);

    match serde_json::to_string(&updated_filter) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn destroy_filter(filter_id: i32, app_handle: tauri::AppHandle) {
    log::debug!(target: "chaski:commands","Command destroy_filter. filter_id: {filter_id:?}");

    crate::entities::filters::destroy(filter_id, app_handle)
}

#[command]
pub async fn show_feed(feed_id: i32, app_handle: tauri::AppHandle) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command show_feed. feed_id: {feed_id:?}");

    let result = crate::entities::feeds::show(feed_id, app_handle);

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn import_opml(app_handle: tauri::AppHandle, file_path: String) -> Result<(), ()> {
    log::debug!(target: "chaski:commands","Command import_opml. file_path: {file_path:?}");

    send_notification(
        &app_handle,
        "Importing OPML",
        "The file will be processed, it could take a while.",
    );

    let result = crate::utils::opml_utils::opml_file_to_new_feeds(file_path.as_str()).await;
    match result {
        Ok(new_feeds) => {
            send_notification(
                &app_handle,
                "Importing OPML",
                &format!(
                    "{} new feeds were found in the file. They will appear in the app ASAP.",
                    new_feeds.len()
                ),
            );
            crate::entities::feeds::create_list(new_feeds, app_handle);
        }
        Err(err) => {
            log::error!(target: "chaski:commands","Command import_opml. error: {err:?}");
        }
    }

    Ok(())
}

#[command]
pub async fn export_opml(
    app_handle: tauri::AppHandle,
    file_path: String,
    feed_ids: Vec<i32>,
) -> Result<(), ()> {
    log::debug!(target: "chaski:commands", "Command export_opml. file_path: {file_path:?}");

    let final_file_path = crate::utils::opml_utils::ensure_opml_extension(file_path.as_str());
    let result = crate::utils::opml_utils::feed_ids_to_opml(
        final_file_path.as_str(),
        feed_ids,
        app_handle.clone(),
    )
    .await;

    match result {
        Ok(()) => {
            send_notification(
                &app_handle,
                "Exporting OPML",
                &format!("OPML file created at {}", final_file_path),
            );
        }
        Err(err) => {
            log::error!(target: "chaski::commands", "Export OPML failed: {}", err);
        }
    }

    Ok(())
}

#[command]
pub async fn list_configurations(app_handle: tauri::AppHandle) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command list_configurations.");

    let results = crate::entities::configurations::index(app_handle);

    match serde_json::to_string(&results) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn update_configuration(
    configuration_id: i32,
    configuration: Configuration,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command update_configuration. configuration_id: {configuration_id:?}");

    let result =
        crate::entities::configurations::update(configuration_id, configuration, app_handle);

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn rename_folder(
    current_name: String,
    new_name: String,
    app_handle: tauri::AppHandle,
) -> Result<(), ()> {
    log::debug!(target: "chaski:commands","Command rename folder. Current name: {current_name:?}. New: {new_name:?}");
    crate::entities::folders::rename(current_name, new_name, app_handle);
    Ok(())
}

#[command]
pub async fn delete_folder(folder: String, app_handle: tauri::AppHandle) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command delete folder. Folder: {folder:?}");
    let result = crate::entities::folders::delete(folder, app_handle);
    if result {
        Ok(String::from("true"))
    } else {
        Ok(String::from("false"))
    }
}
