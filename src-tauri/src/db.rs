use std::fs;
use std::path::Path;

use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use tauri::Manager;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

pub fn init(app_handle: &tauri::AppHandle) {
    let database_url = get_db_path(app_handle);
    print!("{:?}", database_url);

    if !db_file_exists(&database_url) {
        create_db_file(&database_url);
    }

    run_migrations(app_handle)
}

pub fn establish_connection(app_handle: &tauri::AppHandle) -> SqliteConnection {
    let database_url = get_db_path(app_handle).clone();

    SqliteConnection::establish(&database_url)
        .unwrap_or_else(|_| panic!("Error connecting to the database: {}", database_url))
}

fn run_migrations(app_handle: &tauri::AppHandle) {
    log::info!(target: "chaski:db","Running pending migrations.");
    let mut connection = establish_connection(app_handle);
    connection.run_pending_migrations(MIGRATIONS).unwrap();
}

fn create_db_file(db_path: &String) {
    let db_dir = Path::new(&db_path).parent().unwrap();

    if !db_dir.exists() {
        fs::create_dir_all(db_dir).unwrap();
    }

    fs::File::create(db_path).unwrap();
}

fn db_file_exists(db_path: &String) -> bool {
    Path::new(&db_path).exists()
}

fn get_db_path(app_handle: &tauri::AppHandle) -> String {
    match app_handle.path().app_data_dir() {
        Ok(base_dir) => base_dir.to_str().unwrap().to_string() + "/database.sqlite",
        Err(_) => "database.sqlite".to_string(),
    }
}
