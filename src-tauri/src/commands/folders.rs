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
) -> Result<(), ()> {
    log::debug!(target: "chaski:commands","Command rename folder for account {account_id}. Current name: {current_name:?}. New: {new_name:?}");
    crate::entities::folders::rename(account_id, current_name, new_name, app_handle);
    Ok(())
}

#[command]
pub async fn delete_folder(
    account_id: i32,
    folder: String,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command delete folder. Folder: {folder:?}");

    let result = crate::entities::folders::delete(account_id, folder, app_handle);
    if result {
        Ok(String::from("true"))
    } else {
        Ok(String::from("false"))
    }
}
