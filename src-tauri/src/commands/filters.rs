use crate::models::{Filter, NewFilter};
use tauri::command;

#[command]
pub async fn index_filters(
    filter_filters: Option<crate::entities::filters::FilterFilters>,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command list_filters. filter_filters: {filter_filters:?}");

    let filters = crate::entities::filters::index(filter_filters, app_handle);

    match serde_json::to_string(&filters) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn create_filter(
    new_filter: NewFilter,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command create_filter. new_filter: {new_filter:?}");

    let created_filter = crate::entities::filters::create(new_filter, app_handle);

    match serde_json::to_string(&created_filter) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn update_filter(
    filter_id: i32,
    filter: Filter,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command update_filter. filter_id: {filter_id:?}, filter: {filter:?}");

    let updated_filter = crate::entities::filters::update(filter_id, filter, app_handle);

    match serde_json::to_string(&updated_filter) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn destroy_filter(filter_id: i32, app_handle: tauri::AppHandle) {
    log::debug!(target: "chaski:commands","Command destroy_filter. filter_id: {filter_id:?}");

    crate::entities::filters::destroy(filter_id, app_handle)
}
