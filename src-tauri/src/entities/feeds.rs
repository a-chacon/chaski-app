use crate::core::jobs::collect_feed_content;
use crate::db::establish_connection;
use crate::models::{Feed, NewFeed};
use crate::schema::articles;
use crate::schema::feeds::dsl::*;
use crate::schema::filters;
use chrono::Utc;
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

pub fn create_feed(new_feed: NewFeed, app_handle: tauri::AppHandle) -> Feed {
    use crate::schema::feeds;

    let conn = &mut establish_connection(&app_handle);

    let created_feed = diesel::insert_into(feeds::table)
        .values(&new_feed)
        .returning(Feed::as_returning())
        .get_result(conn)
        .expect("Error saving new post");

    let created_feed_clone = created_feed.clone();

    let cloned_app_handle = app_handle.clone();

    tauri::async_runtime::spawn(async move {
        let _ = collect_feed_content(&created_feed_clone, cloned_app_handle).await;
        let _ = feed_update_loop(created_feed_clone, app_handle).await;
    });

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

pub fn index(app_handle: tauri::AppHandle) -> Vec<Feed> {
    let conn = &mut establish_connection(&app_handle);

    feeds
        .select(Feed::as_select())
        .load(conn)
        .expect("Error loading posts")
}

pub fn create_list(new_feeds: Vec<NewFeed>, app_handle: tauri::AppHandle) -> Vec<Feed> {
    new_feeds
        .into_iter()
        .map(|nf| {
            let cloned_app_handle = app_handle.clone();
            create_feed(nf, cloned_app_handle)
        })
        .collect()
}

pub fn spawn_feed_update_loops(app_handle: tauri::AppHandle) {
    let feed_list = index(app_handle.clone());
    for feed in feed_list {
        log::debug!(target: "chaski:entities","Spawn feed update loop. feed_id: {:?}, feed_title: {:?}", feed.id, feed.title);

        let clone_app_handle = app_handle.clone();
        tauri::async_runtime::spawn(async move {
            let _ = feed_update_loop(feed, clone_app_handle).await;
        });
    }
}

async fn feed_update_loop(mut feed: Feed, app_handle: tauri::AppHandle) {
    loop {
        let current_time = Utc::now().naive_utc();
        let next_update_time = feed
            .last_fetch
            .map(|last_fetch_time| {
                last_fetch_time + Duration::from_secs((feed.update_interval_minutes * 60) as u64)
            })
            .unwrap_or_else(|| Utc::now().naive_utc());

        let wait_time_seconds = next_update_time - current_time;

        if wait_time_seconds.num_seconds() > 0 {
            log::info!(target: "chaski:entities","Next update: feed: {:?}, minutes: {:?}", feed.title, wait_time_seconds.num_minutes());

            sleep(Duration::from_secs(wait_time_seconds.num_seconds() as u64)).await;
        }

        let cloned_app_handle = app_handle.clone();

        match collect_feed_content(&feed, cloned_app_handle).await {
            Ok(_) => {
                log::debug!(target: "chaski:entities","Feed Updated Successfully. feed_id: {:?}", feed.id);
                feed = show(feed.id, app_handle.clone()).unwrap();
            }
            Err(err) => {
                log::error!(target: "chaski:entities","Error Updating feed {:?}: {err:?}", feed.id);
            }
        }
    }
}
