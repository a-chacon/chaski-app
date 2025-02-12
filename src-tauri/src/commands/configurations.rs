use crate::models::Configuration;
use tauri::command;

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
