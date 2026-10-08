use crate::core::jobs::complete_entry;
use crate::entities::entries::EntriesFilters;
use crate::models::{Entry, NewEntry};
use tauri::command;

#[command]
pub async fn list_entries(
    page: i64,
    items: i64,
    filters: Option<EntriesFilters>,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command list_entries. Page: {page:?}, Items: {items:?}, Filters: {filters:?}");

    if let Some(ref f) = filters {
        if let Some(acc_id) = f.account_id_eq {
            let handle = app_handle.clone();
            tauri::async_runtime::spawn(async move {
                if let Some(account) = crate::entities::accounts::show(acc_id, handle.clone()) {
                    if account.kind == "greaderapi" {
                        log::debug!(target: "chaski:sync", "list_entries triggering background sync for account {}", acc_id);
                        if let Err(e) =
                            crate::entities::feeds::full_sync_greaderapi_account(&account, handle)
                                .await
                        {
                            log::warn!(target: "chaski:sync", "Background sync on list_entries failed: {}", e);
                        }
                    }
                }
            });
        }
    }

    let result = crate::entities::entries::get_entries_with_feed(page, items, filters, app_handle);

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn show_entry(entry_id: i32, app_handle: tauri::AppHandle) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command show_entry. entry_id: {entry_id:?}");

    let mut result = crate::entities::entries::show(entry_id, app_handle.clone());

    if let Some(entry_with_feed) = result.as_mut() {
        let scrape_mode =
            crate::entities::configurations::find_by_name("ENTRY_SCRAPE_MODE", app_handle.clone())
                .map(|configuration| configuration.value)
                .unwrap_or(String::from("ON_DEMAND"));

        let has_content = entry_with_feed
            .entry
            .content
            .as_ref()
            .map(|content| !content.trim().is_empty())
            .unwrap_or(false);

        if scrape_mode == "ON_DEMAND" && !has_content {
            let completed_entry = complete_entry(NewEntry::from(&entry_with_feed.entry)).await;

            entry_with_feed.entry.title = completed_entry.title;
            entry_with_feed.entry.description = completed_entry.description;
            entry_with_feed.entry.content = completed_entry.content;

            if let Ok(updated) = crate::entities::entries::update(
                entry_id,
                entry_with_feed.entry.clone(),
                app_handle.clone(),
            ) {
                entry_with_feed.entry = updated;
            }
        }
    }

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn update_entry(
    entry_id: i32,
    mut entry: Entry,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command update_entry. entry_id: {entry_id:?} {entry:?}");

    let has_content = entry
        .content
        .as_ref()
        .map(|content| !content.trim().is_empty())
        .unwrap_or(false);

    if entry.read_later == 1 && !has_content {
        let completed_entry = complete_entry(NewEntry::from(&entry)).await;
        entry.title = completed_entry.title;
        entry.description = completed_entry.description;
        entry.content = completed_entry.content;
    }

    let result = match crate::entities::entries::update(entry_id, entry.clone(), app_handle.clone())
    {
        Ok(r) => r,
        Err(_) => return Err(()),
    };

    push_entry_state_to_greader(entry, app_handle);

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn update_entries_as_read(app_handle: tauri::AppHandle) -> Result<(), ()> {
    log::debug!(target: "chaski:commands","Command update_entries_as_read.");
    crate::entities::entries::update_all_as_read(app_handle);
    Ok(())
}

#[command]
pub async fn update_entries_as_read_by_feed_id(
    feed_id: i32,
    app_handle: tauri::AppHandle,
) -> Result<(), ()> {
    log::debug!(target: "chaski:commands","Command update_entries_as_read_by_feed. feed_id: {feed_id:?}");
    crate::entities::entries::update_all_as_read_by_feed_id(feed_id, app_handle);
    Ok(())
}

fn push_entry_state_to_greader(entry: Entry, app_handle: tauri::AppHandle) {
    let external_id = match entry.external_id.clone() {
        Some(eid) if !eid.is_empty() => eid,
        _ => return,
    };

    tauri::async_runtime::spawn(async move {
        // Load the feed to check if it belongs to a GReader account
        let feed = match crate::entities::feeds::show(entry.feed_id, app_handle.clone()) {
            Some(f) => f,
            None => return,
        };

        let acc_id = match feed.account_id {
            Some(id) => id,
            None => return,
        };

        let account = match crate::entities::accounts::show(acc_id, app_handle.clone()) {
            Some(a) => a,
            None => return,
        };

        if account.kind != "greaderapi" {
            return;
        }

        let client = match crate::integrations::greader::GReaderClient::new(
            account.server_url.unwrap_or_default(),
            account.auth_token.unwrap_or_default(),
        ) {
            Ok(c) => c,
            Err(e) => {
                log::warn!(target: "chaski:sync", "Could not create GReader client for push: {}", e);
                return;
            }
        };

        let ids = vec![external_id];

        // Sync read state
        let read_result = if entry.read == 1 {
            client.mark_as_read(&ids).await
        } else {
            client.mark_as_unread(&ids).await
        };
        if let Err(e) = read_result {
            log::warn!(target: "chaski:sync", "Failed to push read state upstream: {}", e);
        }

        // Sync starred / read_later state
        let starred_result = if entry.read_later == 1 {
            client.mark_as_starred(&ids).await
        } else {
            client.mark_as_unstarred(&ids).await
        };
        if let Err(e) = starred_result {
            log::warn!(target: "chaski:sync", "Failed to push starred state upstream: {}", e);
        }
    });
}
