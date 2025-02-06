use crate::entities::articles::ArticlesFilters;
use crate::models::Article;
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

    let result = crate::entities::articles::show(article_id, app_handle);

    match serde_json::to_string(&result) {
        Ok(json_string) => Ok(json_string),
        Err(_) => Err(()),
    }
}

#[command]
pub async fn update_article(
    article_id: i32,
    article: Article,
    app_handle: tauri::AppHandle,
) -> Result<String, ()> {
    log::debug!(target: "chaski:commands","Command update_article. article_id: {article_id:?}");

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
