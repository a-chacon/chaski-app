// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod core;
mod db;
mod entities {
    pub(crate) mod accounts;
    pub(crate) mod configurations;
    pub(crate) mod entries;
    pub(crate) mod feeds;
    pub(crate) mod filters;
    pub(crate) mod folders;
}

mod utils {
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
use tauri::Manager;
#[cfg(desktop)]
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
};
use tauri_plugin_store::StoreExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let ctx = tauri::generate_context!();
    let is_flatpak = is_flatpak_sandbox();

    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_process::init());

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }));
    }

    let mut builder = builder
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .filter(|metadata| metadata.target().contains("chaski"))
                .level(log::LevelFilter::Debug)
                .max_file_size(10_000_000)
                .targets([
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir {
                        file_name: None,
                    }),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                ])
                .build(),
        );

    #[cfg(desktop)]
    if !is_flatpak {
        builder = builder.plugin(tauri_plugin_updater::Builder::new().build());
        builder = builder.plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ));
    }

    builder
        .setup(move |app| {
            #[cfg(desktop)]
            if !is_flatpak {
                let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
                let open_i = MenuItem::with_id(app, "open", "Open", true, None::<&str>)?;
                let menu = Menu::with_items(app, &[&quit_i, &open_i])?;
                #[cfg_attr(not(target_os = "linux"), allow(unused_mut))]
                let mut tray_builder = TrayIconBuilder::new()
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
                    .icon(app.default_window_icon().unwrap().clone());

                #[cfg(target_os = "linux")]
                {
                    if let Ok(cache_dir) = app.path().app_cache_dir() {
                        tray_builder = tray_builder.temp_dir_path(cache_dir);
                    }
                }

                let _tray = tray_builder.build(app)?;
            }

            db::init(app.handle());
            configure_default_app_settings(app);
            let handler_clone_for_feeds = app.handle().clone();
            feeds::spawn_feeds_update_loop(handler_clone_for_feeds);

            let handler_clone_for_accounts = app.handle().clone();
            accounts::spawn_greaderapi_accounts_sync_loop(handler_clone_for_accounts);
            Ok(())
        })
        .on_window_event(|window, event| {
            #[cfg(desktop)]
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                window.hide().unwrap();
                api.prevent_close();
            }
            #[cfg(mobile)]
            let _ = (window, event);
        })
        .invoke_handler(tauri::generate_handler![
            commands::feeds::fetch_site_feeds,
            commands::feeds::create_feed,
            commands::feeds::index_feeds,
            commands::feeds::destroy_feed,
            commands::entries::list_entries,
            commands::folders::list_folders,
            commands::entries::show_entry,
            commands::entries::update_entry,
            commands::feeds::update_feed,
            commands::entries::update_entries_as_read,
            commands::folders::update_entries_as_read_by_folder,
            commands::entries::update_entries_as_read_by_feed_id,
            commands::feeds::collect_feed_content,
            commands::utils::full_text_search,
            commands::utils::get_env,
            commands::utils::is_flatpak,
            commands::filters::create_filter,
            commands::filters::update_filter,
            commands::filters::destroy_filter,
            commands::filters::index_filters,
            commands::feeds::show_feed,
            commands::utils::import_opml,
            commands::utils::export_opml,
            commands::configurations::list_configurations,
            commands::configurations::update_configuration,
            commands::folders::rename_folder,
            commands::folders::delete_folder,
            commands::accounts::index_accounts,
            commands::accounts::create_account,
            commands::accounts::full_sync,
            commands::accounts::show_account,
            commands::accounts::destroy_account,
            commands::accounts::update_account,
            commands::logs::get_log_content
        ])
        .run(ctx)
        .expect("error while building tauri application");
}

fn is_flatpak_sandbox() -> bool {
    #[cfg(target_os = "linux")]
    {
        return std::env::var("FLATPAK_ID").is_ok()
            || std::path::Path::new("/.flatpak-info").exists();
    }

    #[cfg(not(target_os = "linux"))]
    {
        false
    }
}

fn configure_default_app_settings(app: &mut tauri::App) {
    let store = app.store("settings.json").unwrap();

    let default_settings: HashMap<&str, serde_json::Value> = [
        ("onboarding-completed", json!({ "value": false })),
        ("theme", json!({ "value": "orange-dark" })),
        ("entries-layout", json!({ "value": "list" })),
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
