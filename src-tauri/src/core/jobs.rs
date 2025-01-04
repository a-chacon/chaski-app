use crate::entities::articles;
use crate::entities::filters;
use crate::entities::filters::FilterFilters;
use crate::models::{Feed, NewArticle};
use crate::utils::notifications::notify_new_entries;
use crate::utils::scrape::scrape_article_data;
use crate::utils::scrape::scrape_feed_articles;
use chrono::Utc;

pub async fn complete_article(mut article: NewArticle) -> NewArticle {
    let result = scrape_article_data(&article.link).await;

    match result {
        Ok(article_page_data) => {
            article.title = Some(
                article_page_data
                    .title
                    .unwrap_or(article.title.unwrap_or_default()),
            );
            article.description = Some(
                article_page_data
                    .description
                    .unwrap_or(article.description.unwrap_or_default()),
            );
            article.image = Some(
                article_page_data
                    .image
                    .unwrap_or(article.image.unwrap_or_default()),
            );
            article.content = Some(
                article_page_data
                    .content
                    .unwrap_or(article.content.unwrap_or_default()),
            );
        }
        Err(_e) => {
            println!("Error article page data");
        }
    }

    article
}

pub async fn collect_feed_content(feed: &Feed, app_handle: tauri::AppHandle) {
    log::info!(target: "chaski:jobs","Collecting feed content for {:?}", feed.link);
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

        if let Some(first_article) = limited_articles.first() {
            updated_feed.latest_entry = first_article.pub_date;

            let created_articles =
                articles::create_list(limited_articles, app_handle.clone()).await;
            notify_new_entries(app_handle.clone(), feed, created_articles);
        } else {
            log::info!(
                "No articles found in limited_articles for feed {:?}",
                updated_feed.link
            );
        }
    }

    updated_feed.last_fetch = Some(Utc::now().naive_utc());
    crate::entities::feeds::update(feed.id, updated_feed, app_handle.clone());
}
