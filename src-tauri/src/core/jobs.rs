use crate::entities::entries;
use crate::entities::filters;
use crate::entities::filters::FilterFilters;
use crate::models::{Feed, NewEntry};
use crate::utils::notifications::notify_new_entries;
use crate::utils::scrape::{scrape_entry_content, scrape_feed_entries};
use chrono::Utc;

pub async fn complete_entry(mut entry: NewEntry) -> NewEntry {
    let result = scrape_entry_content(&entry.link).await;

    match result {
        Ok(entry_page_data) => {
            if let Some(title) = entry_page_data.title {
                entry.title = Some(title);
            }

            if let Some(description) = entry_page_data.description {
                entry.description = Some(description);
            }

            if let Some(content) = entry_page_data.content {
                entry.content = Some(content);
            }
        }
        Err(_e) => {
            println!("Error scraping entry content");
        }
    }

    entry
}

pub async fn collect_feed_content(feed: &Feed, app_handle: tauri::AppHandle) {
    log::info!(target: "chaski:jobs","Collecting feed content for {:?}", feed.link);
    let response_found_entries = scrape_feed_entries(feed).await;
    let mut updated_feed = feed.clone();

    if let Ok(found_entries) = response_found_entries {
        let filter_filters = Some(FilterFilters {
            feed_id_eq: Some(feed.id),
        });
        let final_entries = filters::apply_filters(
            found_entries,
            filters::index(filter_filters, app_handle.clone()),
        );
        let limit = feed.entry_limit.max(0) as usize;
        let limited_entries = final_entries.into_iter().take(limit).collect::<Vec<_>>();

        if let Some(first_entry) = limited_entries.first() {
            updated_feed.latest_entry = first_entry.pub_date;

            let created_entries =
                entries::create_list(limited_entries, app_handle.clone()).await;
            entries::trim_feed_history(feed.clone(), app_handle.clone());
            notify_new_entries(app_handle.clone(), feed, created_entries);
        } else {
            log::info!(
                "No entries found in limited_entries for feed {:?}",
                updated_feed.link
            );
        }
    }

    updated_feed.last_fetch = Some(Utc::now().naive_utc());
    crate::entities::feeds::update(feed.id, updated_feed, app_handle.clone());
}
