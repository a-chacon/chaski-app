use crate::core::jobs::collect_feed_content;
use crate::db::establish_connection;
use crate::models::{Feed, IndexFeed, NewFeed};
use crate::schema::articles;
use crate::schema::feeds::dsl::*;
use crate::schema::filters;
use chrono::Utc;
use diesel::dsl::{now, sql};
use diesel::prelude::*;
use diesel::sql_query;
use tokio::time::{sleep, Duration};

pub fn show(feed_id: i32, app_handle: tauri::AppHandle) -> Option<Feed> {
    let conn = &mut establish_connection(&app_handle);

    let response = feeds
        .filter(id.eq(feed_id))
        .select(Feed::as_select())
        .first(conn)
        .optional();

    response.unwrap_or_default()
}

pub fn get_folders(app_handle: tauri::AppHandle) -> Vec<String> {
    let conn = &mut establish_connection(&app_handle);

    let result: Vec<Option<String>> = feeds
        .select(folder)
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
        "SELECT feeds.* FROM feeds INNER JOIN feeds_fts ON feeds_fts.feed_id = feeds.id WHERE feeds_fts MATCH '\"{}\"'",
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

pub fn index(app_handle: tauri::AppHandle) -> Vec<IndexFeed> {
    let conn = &mut establish_connection(&app_handle);

    let query = r#"
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
        GROUP BY 
            feeds.id, feeds.title, feeds.folder, feeds.icon
    "#;

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
