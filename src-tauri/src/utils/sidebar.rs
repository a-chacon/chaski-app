use tauri::Emitter;

pub const SIDEBAR_UPDATED_EVENT: &str = "sidebar://updated";

/// Notifies the frontend sidebar that it should refetch its feeds.
/// `account_id` of `None` means "any account".
pub fn emit_sidebar_updated(
    app_handle: &tauri::AppHandle,
    account_id: impl Into<Option<i32>>,
    entity: &str,
    action: &str,
) {
    let payload = serde_json::json!({
        "accountId": account_id.into(),
        "entity": entity,
        "action": action,
    });

    if let Err(err) = app_handle.emit(SIDEBAR_UPDATED_EVENT, payload) {
        log::warn!(target: "chaski:commands", "Failed to emit sidebar update event: {err:?}");
    }
}
