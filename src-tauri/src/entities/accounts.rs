use crate::db::establish_connection;
use crate::models::Account;
use crate::schema::accounts::dsl::*;
use diesel::prelude::*;

pub fn index(app_handle: tauri::AppHandle) -> Vec<Account> {
    accounts
        .select(Account::as_select())
        .load(&mut establish_connection(&app_handle))
        .expect("Error loading configurations")
}
