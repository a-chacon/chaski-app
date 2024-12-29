// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod core;
mod db;
mod entities {
    pub(crate) mod articles;
    pub(crate) mod configurations;
    pub(crate) mod feeds;
    pub(crate) mod filters;
}

mod utils {
    pub(crate) mod article_extractor;
    pub(crate) mod notifications;
    pub(crate) mod opml_utils;
    pub(crate) mod scrape;
}
mod models;
mod schema;
use entities::feeds;
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let ctx = tauri::generate_context!();
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .filter(|metadata| metadata.target().contains("chaski"))
                .build(),
        )
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let open_i = MenuItem::with_id(app, "open", "Open", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i, &open_i])?;
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .menu_on_left_click(true)
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
            let handler_clone = app.handle().clone();
            feeds::spawn_feeds_update_loop(handler_clone);
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
            commands::list_feeds,
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
            commands::update_configuration
        ])
        .run(ctx)
        .expect("error while building tauri application");
}
