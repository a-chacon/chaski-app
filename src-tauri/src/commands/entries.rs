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

            entry_with_feed.entry = crate::entities::entries::update(
                entry_id,
                entry_with_feed.entry.clone(),
                app_handle.clone(),
            );
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
    log::debug!(target: "chaski:commands","Command update_entry. entry_id: {entry_id:?}");

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

    let result = crate::entities::entries::update(entry_id, entry, app_handle);

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
