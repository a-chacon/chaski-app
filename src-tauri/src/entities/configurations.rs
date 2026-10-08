use crate::db::establish_connection;
use crate::models::Configuration;
use crate::schema::configurations::dsl::*;
use chrono::Utc;
use diesel::prelude::*;

pub fn index(app_handle: tauri::AppHandle) -> Vec<Configuration> {
    configurations
        .select(Configuration::as_select())
        .load(&mut establish_connection(&app_handle))
        .expect("Error loading configurations")
}

pub fn update(
    configuration_id: i32,
    mut configuration: Configuration,
    app_handle: tauri::AppHandle,
) -> Configuration {
    configuration.updated_at = Utc::now().naive_utc();

    diesel::update(configurations.find(configuration_id))
        .set(configuration)
        .returning(Configuration::as_returning())
        .get_result(&mut establish_connection(&app_handle))
        .expect("Update feed")
}
