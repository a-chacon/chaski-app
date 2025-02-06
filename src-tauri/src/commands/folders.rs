use tauri::command;

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
pub async fn update_articles_as_read_by_folder(
    folder: String,
    app_handle: tauri::AppHandle,
) -> Result<(), ()> {
    log::debug!(target: "chaski:commands","Command update_articles_as_read_by_folder. folder: {folder:?}");
    crate::entities::articles::update_all_as_read_by_folder(folder, app_handle);
    Ok(())
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
