use crate::db::establish_connection;
use crate::entities::articles;
use crate::entities::filters;
use crate::entities::filters::FilterFilters;
use crate::models::{Article, Feed};
use crate::utils::notifications::notify_new_entries;
use crate::utils::scrape::scrape_article_data;
use crate::utils::scrape::scrape_feed_articles;
use chrono::Utc;
use diesel::prelude::*;

pub async fn complete_article(article: Article, app_handle: tauri::AppHandle) {
    use crate::schema::articles::dsl::*;

    let conn = &mut establish_connection(&app_handle);

    let result = scrape_article_data(&article.link).await;

    match result {
        Ok(article_page_data) => {
            let _ = diesel::update(articles)
                .filter(id.eq(article.id))
                .set((
                    title.eq(article_page_data.title.unwrap_or(article.title.unwrap())),
                    description.eq(article_page_data
                        .description
                        .unwrap_or(article.description.unwrap())),
                    image.eq(article_page_data.image.unwrap_or(article.image.unwrap())),
                    content.eq(article_page_data.content),
                ))
                .execute(conn);
        }
        Err(_e) => {
            println!("Error article page data");
        }
    }
}

pub async fn collect_feed_content(
    feed: &Feed,
    app_handle: tauri::AppHandle,
) -> Result<(), Box<dyn std::error::Error>> {
    let response_found_articles = scrape_feed_articles(feed).await;
    let mut updated_feed = feed.clone();

    if let Ok(found_articles) = response_found_articles {
        let filter_filters = Some(FilterFilters {
            feed_id_eq: Some(feed.id),
        });
        let final_articles = filters::apply_filters(
            found_articles,
            filters::index(filter_filters, app_handle.clone()),
        );

        let limit = feed.entry_limit.max(0) as usize;
        let limited_articles = final_articles.into_iter().take(limit).collect::<Vec<_>>();

        updated_feed.latest_entry = limited_articles.first().unwrap().pub_date;

        let created_articles = articles::create_list(limited_articles, app_handle.clone());

        notify_new_entries(app_handle.clone(), feed, created_articles)
    }

    updated_feed.last_fetch = Some(Utc::now().naive_utc());
    crate::entities::feeds::update(feed.id, updated_feed, app_handle.clone());

    Ok(())
}
