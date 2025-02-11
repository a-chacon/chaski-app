use tauri::command;

#[command]
pub async fn list_folders(account_id: i32, app_handle: tauri::AppHandle) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command list_folders for account {account_id}.");

    let result = crate::entities::feeds::get_folders(account_id, app_handle);

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn update_articles_as_read_by_folder(
    folder: String,
    account_id: i32,
    app_handle: tauri::AppHandle,
) -> Result<(), ()> {
    log::debug!(target: "chaski:commands","Command update_articles_as_read_by_folder. folder: {folder:?}");
    crate::entities::articles::update_all_as_read_by_folder(folder, account_id, app_handle);
    Ok(())
}

#[command]
pub async fn rename_folder(
    account_id: i32,
    current_name: String,
    new_name: String,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    log::debug!(target: "chaski:commands","Command rename folder for account {account_id}. Current name: {current_name:?}. New: {new_name:?}");

    use crate::entities::accounts;
    use crate::integrations::greader::GReaderClient;
    use serde_json::json;

    if let Some(account) = accounts::show(account_id, app_handle.clone()) {
        if account.kind == "greaderapi" {
            if let (Some(server_url), Some(auth_token)) = (account.server_url, account.auth_token) {
                if let Ok(client) = GReaderClient::new(server_url, auth_token) {
                    if client.rename_tag(&current_name, &new_name).await.is_err() {
                        return Ok(json!({
                            "success": false,
                            "message": "We couldn't rename the folder on the remote server. Please try again later.",
                            "data": null
                        }).to_string());
                    }
                }
            }
        }
    }

    // Update the folder locally
    crate::entities::folders::rename(account_id, current_name, new_name, app_handle);

    let response = json!({
        "success": true,
        "message": "Folder renamed successfully",
        "data": null
    });

    Ok(response.to_string())
}

#[command]
pub async fn delete_folder(
    account_id: i32,
    folder: String,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    log::debug!(target: "chaski:commands","Command delete folder. Folder: {folder:?}");

    use crate::entities::accounts;
    use crate::integrations::greader::GReaderClient;
    use serde_json::json;

    if let Some(account) = accounts::show(account_id, app_handle.clone()) {
        if account.kind == "greaderapi" {
            if let (Some(server_url), Some(auth_token)) = (account.server_url, account.auth_token) {
                if let Ok(client) = GReaderClient::new(server_url, auth_token) {
                    if client.disable_tag(&folder).await.is_err() {
                        return Ok(json!({
                            "success": false,
                            "message": "We couldn't delete the folder on the remote server. Please try again later.",
                            "data": null
                        }).to_string());
                    }
                }
            }
        }
    }

    let result = crate::entities::folders::delete(account_id, folder, app_handle);

    let response = json!({
        "success": result,
        "message": if result {
            "Folder deleted successfully"
        } else {
            "Failed to delete folder"
        },
        "data": null
    });

    Ok(response.to_string())
}
