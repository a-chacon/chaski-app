use crate::core::jobs::collect_feed_content;
use crate::db::establish_connection;
use crate::integrations::greader::{greader_item_to_new_entry, GReaderClient};
use crate::models::Account;
use crate::models::{Feed, IndexFeed, NewFeed};
use crate::schema::entries;
use crate::schema::feeds::dsl::*;
use crate::schema::filters;
use chrono::Utc;
use diesel::dsl::{now, sql};
use diesel::prelude::*;
use diesel::sql_query;
use serde::Deserialize;
use std::collections::{HashMap, HashSet};
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

    result.into_iter().flatten().collect()
}

pub fn create_feed(
    mut new_feed: NewFeed,
    should_collect_data: bool,
    app_handle: tauri::AppHandle,
) -> Result<Feed, String> {
    use crate::schema::feeds;

    let conn = &mut establish_connection(&app_handle);

    if new_feed.folder.is_none() {
        new_feed.folder = Some(String::from("Quipu"));
    }

    if !should_collect_data {
        new_feed.last_fetch = None;
    }

    new_feed.default_entry_type = String::from("entry");

    let created_feed = crate::db::with_retry(|| {
        diesel::insert_into(feeds::table)
            .values(&new_feed)
            .returning(Feed::as_returning())
            .get_result(conn)
    })
    .map_err(|e| {
        log::error!(target: "chaski:entities", "Failed to create feed: {}", e);
        e
    })?;

    let created_feed_clone = created_feed.clone();
    let cloned_app_handle = app_handle.clone();

    if should_collect_data {
        tauri::async_runtime::spawn(async move {
            let _ = collect_feed_content(&created_feed_clone, cloned_app_handle).await;
        });
    }

    Ok(created_feed)
}

pub fn update(feed_id: i32, mut feed: Feed, app_handle: tauri::AppHandle) -> Result<Feed, String> {
    let conn = &mut establish_connection(&app_handle);

    feed.updated_at = Utc::now().naive_utc();

    crate::db::with_retry(|| {
        diesel::update(feeds.find(feed_id))
            .set(feed.clone())
            .returning(Feed::as_returning())
            .get_result(conn)
    })
    .map_err(|e| {
        log::error!(target: "chaski:entities", "Failed to update feed {}: {}", feed_id, e);
        e
    })
}

pub async fn full_text_search(
    text: &String,
    account_id_filter: Option<i32>,
    app_handle: tauri::AppHandle,
) -> Vec<Feed> {
    let conn = &mut establish_connection(&app_handle);

    let mut query = format!(
        "SELECT feeds.* FROM feeds INNER JOIN feeds_fts ON feeds_fts.feed_id = feeds.id WHERE feeds_fts MATCH '\"{}\"'",
        text
    );

    if let Some(account_id_eq) = account_id_filter {
        query.push_str(&format!(" AND feeds.account_id = {}", account_id_eq));
    }

    query.push_str(" LIMIT 15");

    sql_query(query)
        .load::<Feed>(conn)
        .expect("Error loading feeds")
}

pub fn destroy(feed_id: i32, app_handle: tauri::AppHandle) {
    let conn = &mut establish_connection(&app_handle);

    let _ = diesel::delete(filters::table.filter(filters::feed_id.eq(feed_id))).execute(conn);
    let _ = diesel::delete(entries::table.filter(entries::feed_id.eq(feed_id))).execute(conn);
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
            COALESCE(COUNT(entries.id), 0) AS unread_count
        FROM
            feeds
        LEFT JOIN
            entries
        ON
            entries.feed_id = feeds.id
            AND entries.read = 0
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
        .filter_map(|nf| {
            let cloned_app_handle = app_handle.clone();
            match create_feed(nf, false, cloned_app_handle) {
                Ok(feed) => Some(feed),
                Err(e) => {
                    log::error!(target: "chaski:entities", "Skipping feed in create_list: {}", e);
                    None
                }
            }
        })
        .collect()
}

pub fn delete_list(feed_ids: Vec<i32>, app_handle: tauri::AppHandle) {
    let conn = &mut establish_connection(&app_handle);

    diesel::delete(filters::table.filter(filters::feed_id.eq_any(&feed_ids)))
        .execute(conn)
        .expect("Error deleting related filters");

    diesel::delete(entries::table.filter(entries::feed_id.eq_any(&feed_ids)))
        .execute(conn)
        .expect("Error deleting related entries");

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
        sleep(Duration::from_millis(500)).await;
        let conn = &mut establish_connection(&app_handle);

        // Skip feeds belonging to a GReader account — their entries come from
        // the GReader sync loop, not direct RSS polling.
        let feeds_to_update: Vec<Feed> = feeds
            .filter(
                sql::<diesel::sql_types::Timestamp>(
                    "datetime(feeds.last_fetch, '+' || feeds.update_interval_minutes || ' minutes')",
                )
                .lt(now)
                .or(last_fetch.is_null()),
            )
            .filter(account_id.is_null())
            .load::<Feed>(conn)
            .expect("Error loading feeds that need to be updated");

        for feed in feeds_to_update {
            let cloned_app_handle = app_handle.clone();
            collect_feed_content(&feed, cloned_app_handle).await;
        }

        sleep(Duration::from_secs(60)).await;
    }
}

pub async fn full_sync_greaderapi_account(
    account: &Account,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let client = GReaderClient::new(
        account.server_url.clone().unwrap_or_default(),
        account.auth_token.clone().unwrap_or_default(),
    )
    .map_err(|e| {
        log::error!("Failed to create GReader client: {}", e);
        e
    })?;

    // ── Phase 1: sync feed list ───────────────────────────────────────────────
    sync_feeds(&client, account, app_handle.clone()).await?;

    // ── Phase 2: sync entries ─────────────────────────────────────────────────
    sync_entries(&client, account, app_handle.clone()).await?;

    Ok(())
}

// Keep old name as an alias so existing callers don't break
pub async fn full_sync_greaderapi_account_feeds(
    account: &Account,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    full_sync_greaderapi_account(account, app_handle).await
}

async fn sync_feeds(
    client: &GReaderClient,
    account: &Account,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let conn = &mut establish_connection(&app_handle);

    let api_feeds = client.get_feeds().await.map_err(|e| {
        log::error!("Failed to get API feeds: {}", e);
        e
    })?;

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

    for (ext_id, new_feed) in &api_feed_map {
        if !db_feed_map.contains_key(ext_id) {
            let mut feed_to_create = new_feed.clone();
            feed_to_create.account_id = Some(account.id);
            to_create.push(feed_to_create);
        }
    }

    for (ext_id, db_feed) in &db_feed_map {
        if !api_feed_map.contains_key(ext_id) {
            to_delete.push(db_feed.id);
        }
    }

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

async fn sync_entries(
    client: &GReaderClient,
    account: &Account,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    log::info!(target: "chaski:sync", "Starting entries sync for account {} (ID: {})", account.name, account.id);

    // ── 1. Fetch remote unread + starred IDs ──────────────────────────────────
    let unread_ids: HashSet<String> = client
        .get_unread_ids(25_000)
        .await
        .unwrap_or_else(|e| {
            log::warn!(target: "chaski:sync", "Could not fetch unread IDs: {}", e);
            vec![]
        })
        .into_iter()
        .collect();

    let starred_ids: HashSet<String> = client
        .get_starred_ids(10_000)
        .await
        .unwrap_or_else(|e| {
            log::warn!(target: "chaski:sync", "Could not fetch starred IDs: {}", e);
            vec![]
        })
        .into_iter()
        .collect();

    let remote_ids: HashSet<String> = unread_ids.union(&starred_ids).cloned().collect();

    if remote_ids.is_empty() {
        log::info!(target: "chaski:sync", "No remote IDs to sync for account {}", account.id);
        return Ok(());
    }

    // ── 2. Load local state ───────────────────────────────────────────────────
    // Build a map: external_id -> (entry_id, read, read_later) for all entries
    // belonging to this account's feeds.
    let conn = &mut establish_connection(&app_handle);

    // Get all feed ids for this account
    let account_feed_ids: Vec<i32> = feeds
        .filter(account_id.eq(account.id))
        .select(id)
        .load(conn)
        .expect("Error loading feed ids for account");

    if account_feed_ids.is_empty() {
        log::info!(target: "chaski:sync", "No feeds for account {}, skipping entry sync", account.id);
        return Ok(());
    }

    // Load existing entries: (external_id, local_id, read, read_later)
    #[derive(QueryableByName, Debug)]
    struct LocalEntryState {
        #[diesel(sql_type = diesel::sql_types::Text)]
        #[diesel(column_name = "external_id")]
        ext_id: String,
        #[diesel(sql_type = diesel::sql_types::Integer)]
        entry_id: i32,
        #[diesel(sql_type = diesel::sql_types::Integer)]
        #[diesel(column_name = "read")]
        is_read: i32,
        #[diesel(sql_type = diesel::sql_types::Integer)]
        #[diesel(column_name = "read_later")]
        is_read_later: i32,
    }

    let feed_ids_sql = account_feed_ids
        .iter()
        .map(|i| i.to_string())
        .collect::<Vec<_>>()
        .join(",");

    let local_entries: Vec<LocalEntryState> = sql_query(format!(
        "SELECT external_id, id as entry_id, read, read_later FROM entries \
         WHERE feed_id IN ({}) AND external_id IS NOT NULL",
        feed_ids_sql
    ))
    .load(conn)
    .unwrap_or_default();

    let local_map: HashMap<String, (i32, i32, i32)> = local_entries
        .into_iter()
        .map(|e| (e.ext_id, (e.entry_id, e.is_read, e.is_read_later)))
        .collect();

    let local_ids: HashSet<String> = local_map.keys().cloned().collect();

    // ── 3. Determine missing entries (need to fetch from remote) ──────────────
    let missing_ids: Vec<String> = remote_ids.difference(&local_ids).cloned().collect();

    log::info!(
        target: "chaski:sync",
        "Account {}: {} remote, {} local, {} to fetch",
        account.id,
        remote_ids.len(),
        local_ids.len(),
        missing_ids.len()
    );

    // ── 4. Fetch and insert missing entries in batches of 250 ─────────────────
    if !missing_ids.is_empty() {
        // Build a map: feed external_id -> local feed id
        let account_feeds: Vec<Feed> = feeds
            .filter(account_id.eq(account.id))
            .load(conn)
            .expect("Error loading feeds for account");

        let feed_ext_to_id: HashMap<String, i32> = account_feeds
            .iter()
            .map(|f| {
                // GReader stream_id for a feed is "feed/<url>"
                let key = format!("feed/{}", f.link);
                (key, f.id)
            })
            .collect();

        // Also index by external_id stored in the feeds table (the "feed/..." form)
        let feed_ext_id_to_id: HashMap<String, i32> = account_feeds
            .iter()
            .filter_map(|f| f.external_id.as_ref().map(|eid| (eid.clone(), f.id)))
            .collect();

        // Guard against the API returning duplicate IDs within a batch
        let mut inserted_in_run: HashSet<String> = local_ids.clone();

        for chunk in missing_ids.chunks(250) {
            match client.get_items_contents(chunk).await {
                Ok(items) => {
                    for item in &items {
                        // Skip if we already inserted this ID earlier in the run
                        if inserted_in_run.contains(&item.id) {
                            continue;
                        }

                        // Resolve feed_id from origin stream_id
                        let feed_id = item
                            .origin
                            .as_ref()
                            .and_then(|o| {
                                feed_ext_to_id
                                    .get(&o.stream_id)
                                    .or_else(|| feed_ext_id_to_id.get(&o.stream_id))
                            })
                            .copied();

                        let feed_id = match feed_id {
                            Some(fid) => fid,
                            None => {
                                log::warn!(
                                    target: "chaski:sync",
                                    "Could not resolve feed for item {} origin {:?}",
                                    item.id,
                                    item.origin.as_ref().map(|o| &o.stream_id)
                                );
                                continue;
                            }
                        };

                        let new_entry = greader_item_to_new_entry(item, feed_id);

                        let result = crate::db::with_retry(|| {
                            diesel::insert_into(entries::table)
                                .values(&new_entry)
                                .execute(conn)
                        });

                        match result {
                            Ok(_) => {
                                inserted_in_run.insert(item.id.clone());
                            }
                            Err(e) => {
                                log::warn!(target: "chaski:sync", "Failed to insert entry {}: {}", item.id, e);
                            }
                        }
                    }
                }
                Err(e) => {
                    log::error!(target: "chaski:sync", "Failed to fetch item contents: {}", e);
                }
            }
        }
    }

    // ── 5. Reconcile read state ───────────────────────────────────────────────
    // Remote is the source of truth, but we must be careful:
    //   - If remote says UNREAD  → always trust it (mark local as unread)
    //   - If remote says READ    → only trust it if the entry is in remote_ids
    //     (unread OR starred). Entries absent from both streams may simply be
    //     beyond the sync limit or old read items we don't need to touch.
    //   - Starred: same logic — only unstar locally if remote explicitly has
    //     the entry in its starred stream and it's not starred there.
    let mut to_mark_read: Vec<i32> = Vec::new();
    let mut to_mark_unread: Vec<i32> = Vec::new();
    let mut to_mark_starred: Vec<i32> = Vec::new();
    let mut to_mark_unstarred: Vec<i32> = Vec::new();

    for (ext_id, (entry_id, local_read, local_read_later)) in &local_map {
        let remote_is_unread = unread_ids.contains(ext_id);
        let remote_is_starred = starred_ids.contains(ext_id);
        let in_remote_window = remote_ids.contains(ext_id);

        // read reconcile
        if remote_is_unread && *local_read == 1 {
            // Remote says unread, local says read → correct locally
            to_mark_unread.push(*entry_id);
        } else if in_remote_window && !remote_is_unread && *local_read == 0 {
            // Entry is known to remote (in unread or starred window) but not
            // in the unread list → remote considers it read
            to_mark_read.push(*entry_id);
        }

        // starred reconcile
        if remote_is_starred && *local_read_later == 0 {
            to_mark_starred.push(*entry_id);
        } else if in_remote_window && !remote_is_starred && *local_read_later == 1 {
            to_mark_unstarred.push(*entry_id);
        }
    }

    if !to_mark_read.is_empty() {
        match crate::db::with_retry(|| {
            diesel::update(entries::table.filter(entries::id.eq_any(&to_mark_read)))
                .set(entries::read.eq(1))
                .execute(conn)
        }) {
            Ok(n) => log::info!(target: "chaski:sync", "Marked {} entries as read", n),
            Err(e) => log::error!(target: "chaski:sync", "Failed to mark entries read: {}", e),
        }
    }

    if !to_mark_unread.is_empty() {
        match crate::db::with_retry(|| {
            diesel::update(entries::table.filter(entries::id.eq_any(&to_mark_unread)))
                .set(entries::read.eq(0))
                .execute(conn)
        }) {
            Ok(n) => log::info!(target: "chaski:sync", "Marked {} entries as unread", n),
            Err(e) => log::error!(target: "chaski:sync", "Failed to mark entries unread: {}", e),
        }
    }

    if !to_mark_starred.is_empty() {
        match crate::db::with_retry(|| {
            diesel::update(entries::table.filter(entries::id.eq_any(&to_mark_starred)))
                .set(entries::read_later.eq(1))
                .execute(conn)
        }) {
            Ok(n) => log::info!(target: "chaski:sync", "Marked {} entries as starred", n),
            Err(e) => log::error!(target: "chaski:sync", "Failed to mark entries starred: {}", e),
        }
    }

    if !to_mark_unstarred.is_empty() {
        match crate::db::with_retry(|| {
            diesel::update(entries::table.filter(entries::id.eq_any(&to_mark_unstarred)))
                .set(entries::read_later.eq(0))
                .execute(conn)
        }) {
            Ok(n) => log::info!(target: "chaski:sync", "Marked {} entries as unstarred", n),
            Err(e) => log::error!(target: "chaski:sync", "Failed to mark entries unstarred: {}", e),
        }
    }

    log::info!(target: "chaski:sync", "Entries sync complete for account {}", account.id);
    Ok(())
}
