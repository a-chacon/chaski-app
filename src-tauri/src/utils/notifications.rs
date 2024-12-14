use crate::models::{Article, Feed};
use tauri_plugin_notification::NotificationExt;

pub fn notify_new_entries(app_handle: tauri::AppHandle, feed: &Feed, entries: Vec<Article>) {
    if entries.is_empty() || feed.notifications_enabled == 0 {
        return;
    }

    if entries.len() == 1 {
        let entry = &entries[0];
        app_handle
            .notification()
            .builder()
            .title(
                entry
                    .title
                    .clone()
                    .unwrap_or_else(|| "Untitled Entry".to_string()),
            )
            .body(
                entry
                    .description
                    .clone()
                    .unwrap_or_else(|| "No description available.".to_string()),
            )
            .show()
            .unwrap();
    } else {
        app_handle
            .notification()
            .builder()
            .title(feed.title.to_string())
            .body(format!("{} New Entries", entries.len()))
            .show()
            .unwrap();
    }
}

pub fn send_notification(app_handle: &tauri::AppHandle, title: &str, body: &str) {
    app_handle
        .notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .unwrap();
}
