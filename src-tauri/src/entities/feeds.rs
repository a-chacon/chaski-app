use crate::core::jobs::collect_feed_content;
use crate::db::establish_connection;
use crate::integrations::greader::GReaderClient;
use crate::models::Account;
use crate::models::{Feed, IndexFeed, NewFeed};
use crate::schema::articles;
use crate::schema::feeds::dsl::*;
use crate::schema::filters;
use chrono::Utc;
use diesel::dsl::{now, sql};
use diesel::prelude::*;
use diesel::sql_query;
use serde::Deserialize;
use std::collections::HashMap;
use tokio::time::{sleep, Duration};

#[derive(Deserialize, Debug)]
pub struct FeedsFilters {
    account_id_eq: Option<i32>,
}

pub fn show(feed_id: i32, app_handle: tauri::AppHandle) -> Option<Feed> {
    let conn = &mut establish_connection(&app_handle);

    let response = feeds
        .filter(id.eq(feed_id))
        .select(Feed::as_select())
        .first(conn)
        .optional();

    response.unwrap_or_default()
}

pub fn get_folders(account_id_eq: i32, app_handle: tauri::AppHandle) -> Vec<String> {
    let conn = &mut establish_connection(&app_handle);

    let result: Vec<Option<String>> = feeds
        .select(folder)
        .filter(account_id.eq(account_id_eq))
        .distinct()
        .load::<Option<String>>(conn)
        .expect("Error loading folders");

    result
        .into_iter()
        .flatten() // This will convert Option<String> to String by filtering out None
        .collect()
}

pub fn create_feed(
    mut new_feed: NewFeed,
    should_collect_data: bool,
    app_handle: tauri::AppHandle,
) -> Feed {
    use crate::schema::feeds;

    let conn = &mut establish_connection(&app_handle);

    if new_feed.folder.is_none() {
        new_feed.folder = Some(String::from("Quipu"));
    }

    if !should_collect_data {
        new_feed.last_fetch = None;
    }

    let created_feed = diesel::insert_into(feeds::table)
        .values(&new_feed)
        .returning(Feed::as_returning())
        .get_result(conn)
        .expect("Error saving new post");

    let created_feed_clone = created_feed.clone();

    let cloned_app_handle = app_handle.clone();

    if should_collect_data {
        tauri::async_runtime::spawn(async move {
            let _ = collect_feed_content(&created_feed_clone, cloned_app_handle).await;
        });
    }

    created_feed
}

pub fn update(feed_id: i32, mut feed: Feed, app_handle: tauri::AppHandle) -> Feed {
    let conn = &mut establish_connection(&app_handle);

    feed.updated_at = Utc::now().naive_utc();

    diesel::update(feeds.find(feed_id))
        .set(feed)
        .returning(Feed::as_returning())
        .get_result(conn)
        .expect("Update feed")
}

pub async fn full_text_search(text: &String, app_handle: tauri::AppHandle) -> Vec<Feed> {
    let conn = &mut establish_connection(&app_handle);
    let query = format!(
        "SELECT feeds.* FROM feeds INNER JOIN feeds_fts ON feeds_fts.feed_id = feeds.id WHERE feeds_fts MATCH '\"{}\"' LIMIT 15",
        text
    );

    sql_query(query)
        .load::<Feed>(conn)
        .expect("Error loading feeds")
}

pub fn destroy(feed_id: i32, app_handle: tauri::AppHandle) {
    let conn = &mut establish_connection(&app_handle);

    let _ = diesel::delete(filters::table.filter(filters::feed_id.eq(feed_id))).execute(conn);
    let _ = diesel::delete(articles::table.filter(articles::feed_id.eq(feed_id))).execute(conn);
    let _ = diesel::delete(feeds.filter(id.eq(feed_id))).execute(conn);
}

pub fn index(app_handle: tauri::AppHandle, filters: Option<FeedsFilters>) -> Vec<IndexFeed> {
    let conn = &mut establish_connection(&app_handle);

    let mut query = r#"
        SELECT 
            feeds.id, 
            feeds.title, 
            feeds.folder, 
            feeds.icon,
            COALESCE(COUNT(articles.id), 0) AS unread_count
        FROM 
            feeds
        LEFT JOIN 
            articles 
        ON 
            articles.feed_id = feeds.id 
            AND articles.read = 0
    "#
    .to_string();

    if let Some(filters) = filters {
        if let Some(account_id_eq) = filters.account_id_eq {
            query.push_str(&format!(" WHERE feeds.account_id = {}", account_id_eq));
        }
    }
    query.push_str(
        r#"
        GROUP BY 
            feeds.id, feeds.title, feeds.folder, feeds.icon
    "#,
    );

    sql_query(query)
        .load::<IndexFeed>(conn)
        .expect("Error loading feeds with unread count")
}

pub fn create_list(new_feeds: Vec<NewFeed>, app_handle: tauri::AppHandle) -> Vec<Feed> {
    new_feeds
        .into_iter()
        .map(|nf| {
            let cloned_app_handle = app_handle.clone();
            create_feed(nf, false, cloned_app_handle)
        })
        .collect()
}

pub fn delete_list(feed_ids: Vec<i32>, app_handle: tauri::AppHandle) {
    let conn = &mut establish_connection(&app_handle);

    diesel::delete(filters::table.filter(filters::feed_id.eq_any(&feed_ids)))
        .execute(conn)
        .expect("Error deleting related filters");

    diesel::delete(articles::table.filter(articles::feed_id.eq_any(&feed_ids)))
        .execute(conn)
        .expect("Error deleting related articles");

    diesel::delete(feeds.filter(id.eq_any(feed_ids)))
        .execute(conn)
        .expect("Error deleting feeds");
}

pub fn update_list(feeds_to_update: Vec<Feed>, app_handle: tauri::AppHandle) {
    let conn = &mut establish_connection(&app_handle);

    for feed in feeds_to_update {
        diesel::update(feeds.find(feed.id))
            .set((
                title.eq(feed.title),
                link.eq(feed.link),
                icon.eq(feed.icon),
                folder.eq(feed.folder),
                updated_at.eq(Utc::now().naive_utc()),
            ))
            .execute(conn)
            .expect("Error updating feed");
    }
}

pub fn spawn_feeds_update_loop(app_handle: tauri::AppHandle) {
    tauri::async_runtime::spawn(async move {
        let _ = feeds_update_loop(app_handle).await;
    });
}

async fn feeds_update_loop(app_handle: tauri::AppHandle) {
    loop {
        sleep(Duration::from_secs(1)).await;
        let conn = &mut establish_connection(&app_handle);

        let feeds_to_update: Vec<Feed> = feeds
            .filter(
                sql::<diesel::sql_types::Timestamp>(
                    "datetime(feeds.last_fetch, '+' || feeds.update_interval_minutes || ' minutes')",
                )
                    .lt(now)
                    .or(last_fetch.is_null()),
            )
            .load::<Feed>(conn)
            .expect("Error loading feeds that need to be updated");

        for feed in feeds_to_update {
            let cloned_app_handle = app_handle.clone();
            collect_feed_content(&feed, cloned_app_handle).await;
        }

        sleep(Duration::from_secs(60)).await;
    }
}

pub async fn full_sync_greaderapi_account_feeds(
    account: &Account,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let conn = &mut establish_connection(&app_handle);

    // Create GReader client
    let client = match GReaderClient::new(
        account.server_url.clone().unwrap_or_default(),
        account.auth_token.clone().unwrap_or_default(),
    ) {
        Ok(client) => client,
        Err(e) => {
            log::error!("Failed to create GReader client: {}", e);
            return Err(e);
        }
    };

    let api_feeds = match client.get_feeds().await {
        Ok(the_feeds) => the_feeds,
        Err(e) => {
            log::error!("Failed to get API feeds: {}", e);
            return Err(e);
        }
    };

    let db_feeds: Vec<Feed> = feeds
        .filter(account_id.eq(account.id))
        .load(conn)
        .expect("Error loading DB feeds");

    let api_feed_map: HashMap<String, NewFeed> = api_feeds
        .into_iter()
        .map(|f| (f.external_id.clone().unwrap_or_default(), f))
        .collect();

    let db_feed_map: HashMap<String, Feed> = db_feeds
        .into_iter()
        .map(|f| (f.external_id.clone().unwrap_or_default(), f))
        .collect();

    let mut to_create = Vec::new();
    let mut to_delete = Vec::new();
    let mut to_update = Vec::new();

    // Find new feeds to create
    for (ext_id, new_feed) in &api_feed_map {
        if !db_feed_map.contains_key(ext_id) {
            let mut feed_to_create = new_feed.clone();
            feed_to_create.account_id = Some(account.id);
            to_create.push(feed_to_create);
        }
    }

    // Find feeds to delete
    for (ext_id, db_feed) in &db_feed_map {
        if !api_feed_map.contains_key(ext_id) {
            to_delete.push(db_feed.id);
        }
    }

    // Find feeds to update
    for (ext_id, db_feed) in &db_feed_map {
        if let Some(api_feed) = api_feed_map.get(ext_id) {
            if feed_needs_update(db_feed, api_feed) {
                let mut updated_feed = db_feed.clone();
                updated_feed.title = api_feed.title.clone();
                updated_feed.link = api_feed.link.clone();
                updated_feed.icon = api_feed.icon.clone();
                updated_feed.folder = api_feed.folder.clone();
                to_update.push(updated_feed);
            }
        }
    }

    if !to_create.is_empty() {
        create_list(to_create, app_handle.clone());
    }

    if !to_delete.is_empty() {
        delete_list(to_delete, app_handle.clone());
    }

    if !to_update.is_empty() {
        update_list(to_update, app_handle.clone());
    }

    Ok(())
}

fn feed_needs_update(db_feed: &Feed, api_feed: &NewFeed) -> bool {
    db_feed.title != api_feed.title
        || db_feed.link != api_feed.link
        || db_feed.icon != api_feed.icon
        || db_feed.folder != api_feed.folder
}
