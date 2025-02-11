use crate::entities::feeds::FeedsFilters;
use crate::models::{Feed, NewFeed};
use serde_json::json;
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
pub async fn create_feed(
    new_feed: NewFeed,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    log::debug!(target: "chaski:commands","Command created_feed. Params: {new_feed:?}");
    use serde_json::json;

    if let Some(account_id) = new_feed.account_id {
        use crate::entities::accounts;
        use crate::integrations::greader::GReaderClient;

        if let Some(account) = accounts::show(account_id, app_handle.clone()) {
            if account.kind == "greaderapi" {
                if let (Some(server_url), Some(auth_token)) =
                    (account.server_url, account.auth_token)
                {
                    if let Ok(client) = GReaderClient::new(server_url, auth_token) {
                        if client.create_feed(&new_feed).await.is_err() {
                            return Ok(json!({
                            "success": false,
                            "message": "We couldn't create the feed in the remote server. Please try again later.",
                            "data": null
                        }).to_string());
                        }
                    }
                }
            }
        }
    }

    let created_feed = crate::entities::feeds::create_feed(new_feed, true, app_handle);

    let response = json!({
        "success": true,
        "message": "Feed created successfully",
        "data": created_feed
    });

    Ok(response.to_string())
}

#[command]
pub async fn destroy_feed(feed_id: i32, app_handle: tauri::AppHandle) -> Result<String, String> {
    log::debug!(target: "chaski:commands", "Command destroy_feed. Params: {feed_id:?}");

    use crate::entities::accounts;
    use crate::integrations::greader::GReaderClient;
    use serde_json::json;

    if let Some(feed) = crate::entities::feeds::show(feed_id, app_handle.clone()) {
        if let Some(external_id) = feed.external_id {
            // If it has an external_id, we need to delete it from the remote server
            if let Some(account_id) = feed.account_id {
                if let Some(account) = accounts::show(account_id, app_handle.clone()) {
                    if account.kind == "greaderapi" {
                        if let (Some(server_url), Some(auth_token)) =
                            (account.server_url, account.auth_token)
                        {
                            if let Ok(client) = GReaderClient::new(server_url, auth_token) {
                                if client.delete_feed(&feed.link).await.is_err() {
                                    return Ok(json!({
                                        "success": false,
                                        "message": "We couldn't delete the feed from the remote server. Please try again later.",
                                        "data": null
                                    }).to_string());
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    crate::entities::feeds::destroy(feed_id, app_handle);

    let response = json!({
        "success": true,
        "message": "Feed deleted successfully",
        "data": null
    });

    Ok(response.to_string())
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
) -> Result<String, String> {
    log::debug!(target: "chaski:commands","Command update_feed. feed_id: {feed_id:?}, feed: {feed:?}");
    use serde_json::json;

    // If feed has an external_id, sync with remote server
    if let Some(external_id) = &feed.external_id {
        if let Some(account_id) = feed.account_id {
            use crate::entities::accounts;
            use crate::integrations::greader::GReaderClient;

            if let Some(account) = accounts::show(account_id, app_handle.clone()) {
                if account.kind == "greaderapi" {
                    if let (Some(server_url), Some(auth_token)) =
                        (account.server_url, account.auth_token)
                    {
                        if let Ok(client) = GReaderClient::new(server_url, auth_token) {
                            if client.update_feed(&feed).await.is_err() {
                                return Ok(json!({
                                    "success": false,
                                    "message": "We couldn't update the feed on the remote server. Please try again later.",
                                    "data": null
                                }).to_string());
                            }
                        }
                    }
                }
            }
        }
    }

    // Update the feed locally
    let result = crate::entities::feeds::update(feed_id, feed, app_handle);

    let response = json!({
        "success": true,
        "message": "Feed updated successfully",
        "data": result
    });

    Ok(response.to_string())
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
