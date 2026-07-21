use crate::core::jobs::complete_entry;
use crate::db::establish_connection;
use crate::models::{Entry, EntryWithFeed, Feed, NewEntry, ShortEntry, ShortEntryWithFeed};
use chrono::{NaiveDate, NaiveDateTime};
use diesel::prelude::*;
use diesel::sql_query;
use serde::Deserialize;

use crate::schema::entries;
use crate::schema::entries::dsl::*;
use crate::schema::feeds;
use crate::schema::feeds::dsl::*;

#[derive(Deserialize, Debug)]
pub struct EntriesFilters {
    feed_id_eq: Option<i32>,
    read_later_eq: Option<i32>,
    read_eq: Option<i32>,
    pub_date_eq: Option<String>,
    folder_eq: Option<String>,
    account_id_eq: Option<i32>,
}

pub fn get_entries_with_feed(
    page: i64,
    items: i64,
    filters: Option<EntriesFilters>,
    app_handle: tauri::AppHandle,
) -> Vec<ShortEntryWithFeed> {
    let offset = (page - 1) * items;

    let mut query = entries
        .inner_join(feeds)
        .select((ShortEntry::as_select(), Feed::as_select()))
        .filter(hide.eq(0))
        .limit(items)
        .offset(offset)
        .order(pub_date.desc())
        .into_boxed();

    if let Some(filter) = filters {
        if let Some(feed_id_eq) = filter.feed_id_eq {
            query = query.filter(entries::feed_id.eq(feed_id_eq));
        }

        if let Some(read_later_eq) = filter.read_later_eq {
            query = query.filter(entries::read_later.eq(read_later_eq));
        }

        if let Some(read_eq) = filter.read_eq {
            query = query.filter(entries::read.eq(read_eq));
        }

        if let Some(pub_date_eq) = filter.pub_date_eq {
            let parse_from_str = NaiveDate::parse_from_str;
            match parse_from_str(pub_date_eq.as_str(), "%Y-%m-%d") {
                Ok(date) => {
                    // Create NaiveDateTime at the start (midnight) and end of the day
                    let date_start: NaiveDateTime = date.and_hms_opt(0, 0, 0).unwrap();
                    let date_end: NaiveDateTime = date.and_hms_opt(23, 59, 59).unwrap();

                    // Apply filter to the query
                    query = query.filter(
                        entries::pub_date
                            .ge(date_start)
                            .and(entries::pub_date.le(date_end)),
                    );
                }
                Err(err) => {
                    // Handle parsing error appropriately
                    eprintln!("Date parsing error: {}", err);
                }
            }
        }
        if let Some(folder_eq) = filter.folder_eq {
            query = query.filter(feeds::folder.eq(folder_eq));
        }

        if let Some(account_id_eq) = filter.account_id_eq {
            query = query.filter(feeds::account_id.eq(account_id_eq));
        }
    }

    let entries_with_feeds: Vec<(ShortEntry, Feed)> = query
        .load::<(ShortEntry, Feed)>(&mut establish_connection(&app_handle))
        .expect("Error loading entries with feeds");

    entries_with_feeds
        .into_iter()
        .map(|(entry, feed)| ShortEntryWithFeed { entry, feed })
        .collect()
}

pub fn show(entry_id: i32, app_handle: tauri::AppHandle) -> Option<EntryWithFeed> {
    let response = entries
        .inner_join(feeds)
        .filter(entries::id.eq(entry_id))
        .select((Entry::as_select(), Feed::as_select()))
        .first::<(Entry, Feed)>(&mut establish_connection(&app_handle))
        .optional();

    match response {
        Ok(Some((entry, feed))) => Some(EntryWithFeed { entry, feed }),
        Ok(None) => None,
        Err(_) => None, // Handle the error as needed
    }
}

pub fn update(entry_id: i32, entry: Entry, app_handle: tauri::AppHandle) -> Entry {
    diesel::update(entries.find(entry_id))
        .set(entry)
        .returning(Entry::as_returning())
        .get_result(&mut establish_connection(&app_handle))
        .expect("Update entry")
}

pub fn update_all_as_read(app_handle: tauri::AppHandle) {
    let conn = &mut establish_connection(&app_handle);

    let result = diesel::update(entries).set(read.eq(1)).execute(conn);

    match result {
        Ok(count) => {
            log::info!(target: "chaski:entries","All entries updated as read, {:?}", count);
        }
        Err(e) => {
            log::error!(target: "chaski:entries","Error updating all entries as read: {:?}", e);
        }
    }
}

pub fn update_all_as_read_by_feed_id(feed_id_eq: i32, app_handle: tauri::AppHandle) {
    let conn = &mut establish_connection(&app_handle);
    let result = diesel::update(entries)
        .set(read.eq(1))
        .filter(entries::feed_id.eq(feed_id_eq))
        .execute(conn);

    match result {
        Ok(count) => {
            log::info!(target: "chaski:entries","All entries by feed updated as read, {:?}", count);
        }
        Err(e) => {
            log::error!(target: "chaski:entries","Error updating all entries by feed as read: {:?}", e);
        }
    }
}

pub fn update_all_as_read_by_folder(
    folder_eq: String,
    account_id_eq: i32,
    app_handle: tauri::AppHandle,
) {
    let conn = &mut establish_connection(&app_handle);
    let query = format!(
        "UPDATE entries SET read = 1 WHERE feed_id IN (SELECT id FROM feeds WHERE folder = {:?} AND account_id = {});",
        folder_eq, account_id_eq
    );

    let result = sql_query(query).execute(conn);

    match result {
        Ok(count) => {
            log::info!(target: "chaski:entries","All entries by folder and account updated as read, {:?}", count);
        }
        Err(e) => {
            log::error!(target: "chaski:entries","Error updating all entries by folder and account as read: {:?}", e);
        }
    }
}

pub async fn full_text_search(
    text: &String,
    account_id_filter: Option<i32>,
    app_handle: tauri::AppHandle,
) -> Vec<Entry> {
    let conn = &mut establish_connection(&app_handle);

    let mut query = format!(
        "SELECT entries.* FROM entries INNER JOIN entries_fts ON entries_fts.entry_id = entries.id WHERE entries_fts MATCH '\"{}\"'",
        text
    );

    if let Some(account_id_eq) = account_id_filter {
        query.push_str(&format!(
            " AND entries.feed_id IN (SELECT id FROM feeds WHERE account_id = {})",
            account_id_eq
        ));
    }

    query.push_str(" LIMIT 15");

    sql_query(query)
        .load::<Entry>(conn)
        .expect("Error loading feeds")
}

pub fn trim_feed_history(feed: Feed, app_handle: tauri::AppHandle) {
    let conn = &mut establish_connection(&app_handle);

    if feed.history_limit <= 0 {
        return;
    }

    let entry_count: i64 = entries::table
        .filter(entries::feed_id.eq(feed.id))
        .filter(entries::read_later.ne(1))
        .count()
        .get_result(conn)
        .expect("Error counting entries");

    if entry_count <= feed.history_limit as i64 {
        return;
    }

    let to_delete = entry_count - feed.history_limit as i64;

    let delete_ids: Vec<i32> = entries::table
        .filter(entries::feed_id.eq(feed.id))
        .filter(entries::read_later.ne(1))
        .order(entries::pub_date.asc())
        .select(entries::id)
        .limit(to_delete)
        .load(conn)
        .expect("Error getting entry IDs to delete");

    let result = diesel::delete(entries::table)
        .filter(entries::id.eq_any(delete_ids))
        .execute(conn);

    match result {
        Ok(count) => {
            log::info!(target: "chaski:entries","Trimmed {} entries from feed {}", count, feed.id);
        }
        Err(e) => {
            log::error!(target: "chaski:entries","Error trimming feed {} history: {}", feed.id, e);
        }
    }
}

pub async fn create_list(list_entries: Vec<NewEntry>, app_handle: tauri::AppHandle) -> Vec<Entry> {
    let mut created_entries = Vec::new();
    let conn = &mut establish_connection(&app_handle);

    let existing_links: Vec<String> = entries
        .filter(feed_id.eq(list_entries[0].feed_id))
        .select(entries::link)
        .load(conn)
        .unwrap_or_else(|_| Vec::new());

    let filtered_entries: Vec<NewEntry> = list_entries
        .into_iter()
        .filter(|entry| !existing_links.contains(&entry.link))
        .collect();

    let scrape_mode =
        crate::entities::configurations::find_by_name("ENTRY_SCRAPE_MODE", app_handle.clone())
            .map(|configuration| configuration.value)
            .unwrap_or(String::from("ON_DEMAND"));

    for mut new_entry in filtered_entries {
        if scrape_mode == "ALWAYS" && new_entry.content.is_none() {
            new_entry = complete_entry(new_entry).await;
        }

        let result = diesel::insert_into(entries)
            .values(new_entry)
            .returning(Entry::as_returning())
            .get_result(conn);

        match result {
            Ok(created_entry) => {
                created_entries.push(created_entry.clone());
            }
            Err(e) => {
                log::error!("Error saving new entry: {}", e);
            }
        }
    }

    created_entries
}
