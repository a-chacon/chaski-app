use crate::entities::maintenance::{self, StorageUsage};
use tauri::command;

#[command]
pub async fn get_storage_usage(app_handle: tauri::AppHandle) -> Result<StorageUsage, String> {
    tauri::async_runtime::spawn_blocking(move || maintenance::storage_usage(&app_handle))
        .await
        .map_err(|e| e.to_string())?
}

#[command]
pub async fn run_purge_now(app_handle: tauri::AppHandle) -> Result<usize, String> {
    tauri::async_runtime::spawn_blocking(move || maintenance::purge_if_needed(&app_handle))
        .await
        .map_err(|e| e.to_string())?
}
