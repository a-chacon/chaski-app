use crate::db::establish_connection;
use crate::models::{
    Article, ArticleWithFeed, Feed, NewArticle, ShortArticle, ShortArticleWithFeed,
};
use chrono::{NaiveDate, NaiveDateTime};
use diesel::prelude::*;
use diesel::sql_query;
use serde::Deserialize;

use crate::core::jobs::complete_article;
use crate::schema::articles;
use crate::schema::articles::dsl::*;
use crate::schema::feeds;
use crate::schema::feeds::dsl::*;

#[derive(Deserialize, Debug)]
pub struct ArticlesFilters {
    feed_id_eq: Option<i32>,
    read_later_eq: Option<i32>,
    read_eq: Option<i32>,
    pub_date_eq: Option<String>,
    folder_eq: Option<String>,
    account_id_eq: Option<i32>,
}

pub fn get_articles_with_feed(
    page: i64,
    items: i64,
    filters: Option<ArticlesFilters>,
    app_handle: tauri::AppHandle,
) -> Vec<ShortArticleWithFeed> {
    let offset = (page - 1) * items;

    let mut query = articles
        .inner_join(feeds)
        .select((ShortArticle::as_select(), Feed::as_select()))
        .filter(hide.eq(0))
        .limit(items)
        .offset(offset)
        .order(pub_date.desc())
        .into_boxed();

    if let Some(filter) = filters {
        if let Some(feed_id_eq) = filter.feed_id_eq {
            query = query.filter(articles::feed_id.eq(feed_id_eq));
        }

        if let Some(read_later_eq) = filter.read_later_eq {
            query = query.filter(articles::read_later.eq(read_later_eq));
        }

        if let Some(read_eq) = filter.read_eq {
            query = query.filter(articles::read.eq(read_eq));
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
                        articles::pub_date
                            .ge(date_start)
                            .and(articles::pub_date.le(date_end)),
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

    let articles_with_feeds: Vec<(ShortArticle, Feed)> = query
        .load::<(ShortArticle, Feed)>(&mut establish_connection(&app_handle))
        .expect("Error loading articles with feeds");

    articles_with_feeds
        .into_iter()
        .map(|(article, feed)| ShortArticleWithFeed { article, feed })
        .collect()
}

pub fn show(article_id: i32, app_handle: tauri::AppHandle) -> Option<ArticleWithFeed> {
    let response = articles
        .inner_join(feeds)
        .filter(articles::id.eq(article_id))
        .select((Article::as_select(), Feed::as_select()))
        .first::<(Article, Feed)>(&mut establish_connection(&app_handle))
        .optional();

    match response {
        Ok(Some((article, feed))) => Some(ArticleWithFeed { article, feed }),
        Ok(None) => None,
        Err(_) => None, // Handle the error as needed
    }
}

pub fn update(article_id: i32, article: Article, app_handle: tauri::AppHandle) -> Article {
    diesel::update(articles.find(article_id))
        .set(article)
        .returning(Article::as_returning())
        .get_result(&mut establish_connection(&app_handle))
        .expect("Update article")
}

pub fn update_all_as_read(app_handle: tauri::AppHandle) {
    let conn = &mut establish_connection(&app_handle);

    let result = diesel::update(articles).set(read.eq(1)).execute(conn);

    match result {
        Ok(count) => {
            log::info!(target: "chaski:articles","All articles updated as read, {:?}", count);
        }
        Err(e) => {
            log::error!(target: "chaski:articles","Error updating all articles as read: {:?}", e);
        }
    }
}

pub fn update_all_as_read_by_feed_id(feed_id_eq: i32, app_handle: tauri::AppHandle) {
    let conn = &mut establish_connection(&app_handle);
    let result = diesel::update(articles)
        .set(read.eq(1))
        .filter(articles::feed_id.eq(feed_id_eq))
        .execute(conn);

    match result {
        Ok(count) => {
            log::info!(target: "chaski:articles","All articles by feed updated as read, {:?}", count);
        }
        Err(e) => {
            log::error!(target: "chaski:articles","Error updating all articles by feed as read: {:?}", e);
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
        "UPDATE articles SET read = 1 WHERE feed_id IN (SELECT id FROM feeds WHERE folder = {:?} AND account_id = {});",
        folder_eq, account_id_eq
    );

    let result = sql_query(query).execute(conn);

    match result {
        Ok(count) => {
            log::info!(target: "chaski:articles","All articles by folder and account updated as read, {:?}", count);
        }
        Err(e) => {
            log::error!(target: "chaski:articles","Error updating all articles by folder and account as read: {:?}", e);
        }
    }
}

pub async fn full_text_search(text: &String, app_handle: tauri::AppHandle) -> Vec<Article> {
    let conn = &mut establish_connection(&app_handle);
    let query = format!(
        "SELECT articles.* FROM articles INNER JOIN articles_fts ON articles_fts.article_id = articles.id WHERE articles_fts MATCH '\"{}\"' LIMIT 15",
        text
    );

    sql_query(query)
        .load::<Article>(conn)
        .expect("Error loading feeds")
}

pub fn trim_feed_history(feed: Feed, app_handle: tauri::AppHandle) {
    let conn = &mut establish_connection(&app_handle);

    if feed.history_limit <= 0 {
        return;
    }

    let article_count: i64 = articles::table
        .filter(articles::feed_id.eq(feed.id))
        .filter(articles::read_later.ne(1))
        .count()
        .get_result(conn)
        .expect("Error counting articles");

    if article_count <= feed.history_limit as i64 {
        return;
    }

    let to_delete = article_count - feed.history_limit as i64;

    let delete_ids: Vec<i32> = articles::table
        .filter(articles::feed_id.eq(feed.id))
        .filter(articles::read_later.ne(1))
        .order(articles::pub_date.asc())
        .select(articles::id)
        .limit(to_delete)
        .load(conn)
        .expect("Error getting article IDs to delete");

    let result = diesel::delete(articles::table)
        .filter(articles::id.eq_any(delete_ids))
        .execute(conn);

    match result {
        Ok(count) => {
            log::info!(target: "chaski:articles","Trimmed {} articles from feed {}", count, feed.id);
        }
        Err(e) => {
            log::error!(target: "chaski:articles","Error trimming feed {} history: {}", feed.id, e);
        }
    }
}

pub async fn create_list(
    list_articles: Vec<NewArticle>,
    app_handle: tauri::AppHandle,
) -> Vec<Article> {
    let mut created_articles = Vec::new();
    let conn = &mut establish_connection(&app_handle);

    let existing_links: Vec<String> = articles
        .filter(feed_id.eq(list_articles[0].feed_id))
        .select(articles::link)
        .load(conn)
        .unwrap_or_else(|_| Vec::new());

    let filtered_articles: Vec<NewArticle> = list_articles
        .into_iter()
        .filter(|article| !existing_links.contains(&article.link))
        .collect();

    for mut new_article in filtered_articles {
        if new_article.entry_type == "article"
            && (new_article.thumbnail.is_none() || new_article.media_content_url.is_none())
            && new_article.content.is_none()
        {
            new_article = complete_article(new_article).await;
        }

        let result = diesel::insert_into(articles)
            .values(new_article)
            .returning(Article::as_returning())
            .get_result(conn);

        match result {
            Ok(created_article) => {
                created_articles.push(created_article.clone());
            }
            Err(e) => {
                log::error!("Error saving new article: {}", e);
            }
        }
    }

    created_articles
}
