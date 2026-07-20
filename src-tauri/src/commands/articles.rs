use crate::core::jobs::complete_article;
use crate::entities::articles::ArticlesFilters;
use crate::models::{Article, NewArticle};
use tauri::command;

#[command]
pub async fn list_articles(
    page: i64,
    items: i64,
    filters: Option<ArticlesFilters>,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command list_articles. Page: {page:?}, Items: {items:?}, Filters: {filters:?}");

    let result =
        crate::entities::articles::get_articles_with_feed(page, items, filters, app_handle);

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn show_article(article_id: i32, app_handle: tauri::AppHandle) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command show_article. article_id: {article_id:?}");

    let mut result = crate::entities::articles::show(article_id, app_handle.clone());

    if let Some(article_with_feed) = result.as_mut() {
        let scrape_mode = crate::entities::configurations::find_by_name(
            "ARTICLE_SCRAPE_MODE",
            app_handle.clone(),
        )
        .map(|configuration| configuration.value)
        .unwrap_or(String::from("ON_DEMAND"));

        let has_content = article_with_feed
            .article
            .content
            .as_ref()
            .map(|content| !content.trim().is_empty())
            .unwrap_or(false);

        if scrape_mode == "ON_DEMAND" && !has_content {
            let completed_article =
                complete_article(NewArticle::from(&article_with_feed.article)).await;

            article_with_feed.article.title = completed_article.title;
            article_with_feed.article.description = completed_article.description;
            article_with_feed.article.content = completed_article.content;

            article_with_feed.article = crate::entities::articles::update(
                article_id,
                article_with_feed.article.clone(),
                app_handle.clone(),
            );
        }
    }

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn update_article(
    article_id: i32,
    mut article: Article,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command update_article. article_id: {article_id:?}");

    let has_content = article
        .content
        .as_ref()
        .map(|content| !content.trim().is_empty())
        .unwrap_or(false);

    if article.read_later == 1 && !has_content {
        let completed_article = complete_article(NewArticle::from(&article)).await;
        article.title = completed_article.title;
        article.description = completed_article.description;
        article.content = completed_article.content;
    }

    let result = crate::entities::articles::update(article_id, article, app_handle);

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn update_articles_as_read(app_handle: tauri::AppHandle) -> Result<(), ()> {
    log::debug!(target: "chaski:commands","Command update_articles_as_read.");
    crate::entities::articles::update_all_as_read(app_handle);
    Ok(())
}

#[command]
pub async fn update_articles_as_read_by_feed_id(
    feed_id: i32,
    app_handle: tauri::AppHandle,
) -> Result<(), ()> {
    log::debug!(target: "chaski:commands","Command update_articles_as_read_by_feed. feed_id: {feed_id:?}");
    crate::entities::articles::update_all_as_read_by_feed_id(feed_id, app_handle);
    Ok(())
}
