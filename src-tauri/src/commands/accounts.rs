use crate::models::NewAccount;
use serde_json::json;
use tauri::command;

#[command]
pub async fn index_accounts(app_handle: tauri::AppHandle) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command index_accounts.");

    let results = crate::entities::accounts::index(app_handle);

    match serde_json::to_string(&results) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn create_account(
    mut new_account: NewAccount,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command create_account. kind: {}", new_account.kind);

    let result = match new_account.kind.as_str() {
        "local" => Ok(crate::entities::accounts::create(app_handle, new_account)),
        "greaderapi" => {
            let credentials = new_account.credentials.take().ok_or(())?;
            let server_url = new_account.server_url.as_ref().ok_or(())?;

            let creds: serde_json::Value = serde_json::from_str(&credentials).map_err(|_| ())?;
            let email = creds.get("email").ok_or(())?.as_str().ok_or(())?;
            let password = creds.get("password").ok_or(())?.as_str().ok_or(())?;

            let response = match crate::integrations::greader::GReaderClient::login(
                server_url, email, password,
            )
            .await
            {
                Ok(result) => result,
                Err(e) => {
                    log::error!("GReader login failed: {}", e);
                    let response = json!({
                        "success": false,
                        "message": format!("GReader login failed: {}", e),
                        "data": null
                    });
                    return Ok(response.to_string());
                }
            };

            new_account.name = format!("GReader ({})", email);
            new_account.auth_token = Some(response.auth_token);
            new_account.credentials = Some(credentials);

            Ok(crate::entities::accounts::create(app_handle, new_account))
        }
        _ => Err(()),
    };

    match result {
        Ok(account) => {
            let response = json!({
                "success": true,
                "message": "Account created successfully",
                "data": account
            });
            Ok(response.to_string())
        }
        Err(_) => {
            let response = json!({
                "success": false,
                "message": "Failed to create account",
                "data": null
            });
            Ok(response.to_string())
        }
    }
}
