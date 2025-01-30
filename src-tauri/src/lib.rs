// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod core;
mod db;
mod entities {
    pub(crate) mod accounts;
    pub(crate) mod articles;
    pub(crate) mod configurations;
    pub(crate) mod feeds;
    pub(crate) mod filters;
    pub(crate) mod folders;
}

mod utils {
    pub(crate) mod article_extractor;
    pub(crate) mod notifications;
    pub(crate) mod opml_utils;
    pub(crate) mod scrape;
}

mod integrations {
    pub(crate) mod greader;
}

mod models;
mod schema;
use crate::entities::accounts;
use crate::entities::feeds;
use serde_json::json;
use std::collections::HashMap;
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};
use tauri_plugin_store::StoreExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let ctx = tauri::generate_context!();
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .filter(|metadata| metadata.target().contains("chaski"))
                .level(log::LevelFilter::Debug)
                .max_file_size(10_000_000)
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir { file_name: None },
                ))
                .build(),
        )
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let open_i = MenuItem::with_id(app, "open", "Open", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i, &open_i])?;
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "open" => {
                        if let Some(window) = app.get_webview_window("main") {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    }
                    _ => {
                        println!("menu item {:?} not handled", event.id);
                    }
                })
                .icon(app.default_window_icon().unwrap().clone())
                .build(app)?;

            db::init(app.handle());
            configure_default_app_settings(app);
            let handler_clone_for_feeds = app.handle().clone();
            feeds::spawn_feeds_update_loop(handler_clone_for_feeds);

            let handler_clone_for_accounts = app.handle().clone();
            accounts::spawn_greaderapi_accounts_sync_loop(handler_clone_for_accounts);
            Ok(())
        })
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                window.hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            commands::fetch_site_feeds,
            commands::create_feed,
            commands::index_feeds,
            commands::destroy_feed,
            commands::list_articles,
            commands::list_folders,
            commands::show_article,
            commands::update_article,
            commands::update_feed,
            commands::update_articles_as_read,
            commands::update_articles_as_read_by_folder,
            commands::update_articles_as_read_by_feed_id,
            commands::collect_feed_content,
            commands::full_text_search,
            commands::create_filter,
            commands::update_filter,
            commands::destroy_filter,
            commands::index_filters,
            commands::show_feed,
            commands::import_opml,
            commands::export_opml,
            commands::list_configurations,
            commands::update_configuration,
            commands::rename_folder,
            commands::delete_folder,
            commands::index_accounts,
            commands::create_account
        ])
        .run(ctx)
        .expect("error while building tauri application");
}

fn configure_default_app_settings(app: &mut tauri::App) {
    let store = app.store("settings.json").unwrap();

    let default_settings: HashMap<&str, serde_json::Value> = [
        ("onboarding-completed", json!({ "value": false })),
        ("theme", json!({ "value": "orange-dark" })),
        ("articles-layout", json!({ "value": "list" })),
        ("app-mode", json!({ "value": "local" })),
    ]
    .iter()
    .cloned()
    .collect();

    for (key, default_value) in default_settings {
        let setting = store.get(key);

        if setting.is_none() {
            store.set(key, default_value);
        }
    }
}
