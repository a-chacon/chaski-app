use crate::utils::notifications::send_notification;
use serde_json::json;
use tauri::command;

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
pub async fn import_opml(
    account_id: i32,
    file_path: String,
    app_handle: tauri::AppHandle,
) -> Result<(), ()> {
    log::debug!(target: "chaski:commands","Command import_opml. file_path: {file_path:?}");

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

            let mut feeds_with_account = new_feeds;
            for feed in &mut feeds_with_account {
                feed.account_id = Some(account_id);
            }

            crate::entities::feeds::create_list(feeds_with_account, app_handle);
        }
        Err(err) => {
            send_notification(
                &app_handle,
                "Importing OPML",
                &format!("Error importing OPML: {}", err),
            );

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

    // TODO: BY account

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
