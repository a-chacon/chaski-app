use crate::entities::feeds::FeedsFilters;
use crate::models::{Feed, NewFeed};
use tauri::command;

#[command]
pub async fn fetch_site_feeds(site_url: String, account_id: i32) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command fetch_site_feeds. Params: site_url: {site_url:?}, account_id: {account_id}");

    let result = crate::utils::scrape::scrape_site_feeds(site_url).await;

    match result {
        Ok(mut feeds) => {
            for feed in &mut feeds {
                feed.account_id = Some(account_id);
            }

            match serde_json::to_string(&feeds) {
                Ok(json_string) => Ok(json_string),
                Err(_) => Err(()),
            }
        }
        Err(e) => {
            log::error!(target: "chaski:commands","Error scraping site feeds. Error: {e:?}");
            Err(())
        }
    }
}

#[command]
pub async fn create_feed(new_feed: NewFeed, app_handle: tauri::AppHandle) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command created_feed. Params: {new_feed:?}");
    // TODO: if external_id then sync, greader::create_feed(feed)

    let created_feed = crate::entities::feeds::create_feed(new_feed, true, app_handle);

    match serde_json::to_string(&created_feed) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn destroy_feed(feed_id: i32, app_handle: tauri::AppHandle) {
    log::debug!(target: "chaski:commands", "Command destroy_feed. Params: {feed_id:?}");
    // TODO: if has external_id then require sync, greader::destroy_feed(feed)

    crate::entities::feeds::destroy(feed_id, app_handle);
}

#[command]
pub async fn index_feeds(
    app_handle: tauri::AppHandle,
    filters: Option<FeedsFilters>,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command list_feeds. Filters: {filters:?}");

    let results = crate::entities::feeds::index(app_handle, filters);

    match serde_json::to_string(&results) {
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
    // TODO: if has external_id then require sync, greader::update_feed(feed)

    let result = crate::entities::feeds::update(feed_id, feed, app_handle);

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
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
pub async fn show_feed(feed_id: i32, app_handle: tauri::AppHandle) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command show_feed. feed_id: {feed_id:?}");

    let result = crate::entities::feeds::show(feed_id, app_handle);

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}
