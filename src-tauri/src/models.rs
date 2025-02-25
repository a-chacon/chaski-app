use super::schema::{accounts, article_tags, articles, configurations, feeds, filters, tags};
use crate::core::common::{calculate_default_fetch_interval, parse_rfc822_to_naive_datetime};
use chrono::{DateTime, NaiveDateTime, Utc};
use diesel::prelude::*;
use diesel::sql_types::{BigInt, Integer, Text};
use serde::{Deserialize, Serialize};

#[derive(Identifiable, Queryable, Selectable, Serialize, Debug)]
#[diesel(table_name = accounts)]
pub struct Account {
    pub id: i32,
    pub name: String,
    pub kind: String,
    pub auth_token: Option<String>,
    pub credentials: Option<String>,
    pub server_url: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Insertable, Debug, Serialize, Deserialize)]
#[diesel(table_name = accounts)]
pub struct NewAccount {
    pub name: String,
    pub kind: String,
    pub auth_token: Option<String>,
    pub credentials: Option<String>,
    pub server_url: Option<String>,
}

#[derive(
    Identifiable,
    Queryable,
    Selectable,
    Serialize,
    Clone,
    Debug,
    AsChangeset,
    Deserialize,
    QueryableByName,
)]
#[diesel(table_name = feeds)]
#[diesel(belongs_to(Account))]
pub struct Feed {
    pub id: i32,
    pub title: String,
    pub description: String,
    pub link: String,
    pub icon: Option<String>,
    pub last_fetch: Option<NaiveDateTime>,
    pub latest_entry: Option<NaiveDateTime>,
    pub kind: String,
    pub items_count: Option<i32>,
    pub folder: Option<String>,
    pub proxy: String,
    pub entry_limit: i32,
    pub history_limit: i32,
    pub update_interval_minutes: i32,
    pub notifications_enabled: i32,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub account_id: Option<i32>,
    pub external_id: Option<String>,
    pub default_entry_type: String,
}

#[derive(QueryableByName, Queryable, Debug, Serialize)]
pub struct IndexFeed {
    #[diesel(sql_type = Integer)]
    pub id: i32,
    #[diesel(sql_type = Text)]
    pub title: String,
    #[diesel(sql_type = Text)]
    pub folder: String,
    #[diesel(sql_type = Text)]
    pub icon: String,
    #[diesel(sql_type = BigInt)]
    pub unread_count: i64,
}

#[derive(Insertable, Debug, Serialize, Deserialize, Clone)]
#[diesel(table_name = feeds)]
pub struct NewFeed {
    pub title: String,
    pub description: String,
    pub link: String,
    pub icon: Option<String>,
    pub last_fetch: Option<NaiveDateTime>,
    pub latest_entry: Option<NaiveDateTime>,
    pub kind: String,
    pub items_count: Option<i32>,
    pub folder: Option<String>,
    pub update_interval_minutes: i32,
    pub account_id: Option<i32>,
    pub external_id: Option<String>,
    pub default_entry_type: String,
}

#[derive(
    Identifiable,
    Queryable,
    Selectable,
    Serialize,
    Deserialize,
    Associations,
    Debug,
    AsChangeset,
    QueryableByName,
    Clone,
)]
#[diesel(belongs_to(Feed))]
#[diesel(table_name = articles)]
pub struct Article {
    pub id: i32,
    pub title: Option<String>,
    pub link: String,
    pub image: Option<String>,
    pub pub_date: Option<NaiveDateTime>,
    pub description: Option<String>,
    pub content: Option<String>,
    pub read_later: i32,
    pub read: i32,
    pub hide: i32,
    pub author: Option<String>,
    pub feed_id: i32,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub external_id: Option<String>,
    pub entry_type: String,
    pub content_type: String,
}

#[derive(Insertable, Debug)]
#[diesel(table_name = articles)]
pub struct NewArticle {
    pub title: Option<String>,
    pub link: String,
    pub image: Option<String>,
    pub pub_date: Option<NaiveDateTime>,
    pub description: Option<String>,
    pub content: Option<String>,
    pub read_later: i32,
    pub read: i32,
    pub hide: i32,
    pub author: Option<String>,
    pub feed_id: i32,
    pub external_id: Option<String>,
    pub entry_type: String,
    pub content_type: String,
}

#[derive(Debug, PartialEq, Queryable, Selectable, Serialize)]
#[diesel(table_name = articles)]
pub struct ShortArticle {
    pub id: i32,
    pub title: Option<String>,
    pub link: String,
    pub image: Option<String>,
    pub pub_date: Option<NaiveDateTime>,
    pub description: Option<String>,
    pub read_later: i32,
    pub read: i32,
    pub hide: i32,
    pub feed_id: i32,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub entry_type: String,
    pub content_type: String,
}

#[derive(Serialize)]
pub struct ShortArticleWithFeed {
    #[serde(flatten)]
    pub article: ShortArticle,
    pub feed: Feed,
}

#[derive(Serialize)]
pub struct ArticleWithFeed {
    #[serde(flatten)]
    pub article: Article,
    pub feed: Feed,
}

#[derive(Debug, Queryable, Insertable, AsChangeset)]
#[diesel(belongs_to(Article))]
#[diesel(table_name = tags)]
pub struct Tag {
    pub id: i32,
    pub value: String,
    pub article_id: i32,
}

// Define the ArticleTag model (for many-to-many relationships)
#[derive(Debug, Queryable, Insertable)]
#[diesel(table_name = article_tags)]
pub struct ArticleTag {
    pub article_id: i32,
    pub tag_id: i32,
}

#[derive(Debug, Queryable, Insertable, Selectable, Serialize, AsChangeset, Deserialize)]
#[diesel(table_name = filters)]
pub struct Filter {
    pub id: i32,
    pub field: String,
    pub operator: String,
    pub value: String,
    pub logical_operator: String,
    pub feed_id: i32,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

#[derive(Debug, Queryable, Insertable, Selectable, Serialize, Deserialize)]
#[diesel(table_name = filters)]
pub struct NewFilter {
    pub field: String,
    pub operator: String,
    pub value: String,
    pub logical_operator: String,
    pub feed_id: i32,
}

#[derive(Identifiable, Queryable, Selectable, Serialize, Debug, Deserialize, AsChangeset)]
#[diesel(table_name = configurations)]
pub struct Configuration {
    pub id: i32,
    pub name: String,
    pub value: String,
    pub kind: String,
    pub updated_at: NaiveDateTime,
    pub created_at: NaiveDateTime,
}

impl From<rss::Channel> for NewFeed {
    fn from(channel: rss::Channel) -> Self {
        let entries_pub_dates: Vec<DateTime<Utc>> = channel
            .items
            .iter()
            .filter_map(|entry| {
                entry.pub_date.as_ref().and_then(|pub_date_str| {
                    DateTime::parse_from_rfc2822(pub_date_str)
                        .ok()
                        .map(|dt| dt.with_timezone(&Utc))
                })
            })
            .collect();

        let update_interval = calculate_default_fetch_interval(&entries_pub_dates, 30, 1440);

        NewFeed {
            title: channel.title.to_string(),
            description: channel.description.to_string(),
            link: channel.link.to_string(),
            icon: channel.image().map(|img| img.url().to_string()),
            last_fetch: Some(Utc::now().naive_utc()),
            latest_entry: parse_rfc822_to_naive_datetime(channel.pub_date),
            kind: String::from("rss"),
            items_count: Some(channel.items.len() as i32),
            folder: None,
            update_interval_minutes: update_interval,
            account_id: None,
            external_id: None,
            default_entry_type: String::from("article"),
        }
    }
}

impl From<atom_syndication::Feed> for NewFeed {
    fn from(feed: atom_syndication::Feed) -> Self {
        let entries_pub_dates: Vec<DateTime<Utc>> = feed
            .entries
            .iter()
            .map(|entry| entry.updated.with_timezone(&Utc)) // Convert to Utc
            .collect();
        let update_interval: i32 = calculate_default_fetch_interval(&entries_pub_dates, 30, 1440);

        NewFeed {
            title: feed.title.to_string(),
            description: feed
                .subtitle
                .map(|text| text.as_str().to_string())
                .unwrap_or("".to_string()),
            link: feed.base.clone().unwrap_or("".to_string()),
            icon: feed.icon.clone().or(feed.logo.clone()),
            last_fetch: Some(Utc::now().naive_utc()),
            latest_entry: Some(feed.updated.naive_utc()),
            kind: String::from("atom"),
            items_count: Some(feed.entries.len() as i32),
            folder: None,
            update_interval_minutes: update_interval,
            account_id: None,
            external_id: None,
            default_entry_type: String::from("article"),
        }
    }
}

impl NewArticle {
    pub fn from_feed_and_item(feed: &Feed, item: rss::Item) -> Self {
        let mut image = None;
        let mut content_type = String::from("text/html");

        let extensions = item.extensions();
        if let Some(media_map) = extensions.get("media") {
            if let Some(contents) = media_map.get("content") {
                if let Some(first_content) = contents.first() {
                    if let Some(url) = first_content.attrs.get("url").cloned() {
                        image = Some(url);
                        if let Some(media_type) = first_content.attrs.get("type").cloned() {
                            content_type = media_type;
                        }
                    }
                }
            }
        }

        NewArticle {
            feed_id: feed.id,
            title: item.title,
            link: item.link.unwrap_or(feed.link.clone()),
            image,
            pub_date: parse_rfc822_to_naive_datetime(item.pub_date),
            description: crate::core::common::remove_html_tags(item.description),
            content: item.content.clone(),
            read_later: 0,
            read: 0,
            hide: 0,
            author: item.author,
            external_id: None,
            entry_type: feed.default_entry_type.clone(),
            content_type,
        }
    }

    pub fn from_feed_and_entry(feed: &Feed, entry: atom_syndication::Entry) -> Self {
        NewArticle {
            feed_id: feed.id,
            title: Some(entry.title.value),
            link: entry.links.into_iter().nth(0).unwrap().href,
            image: Some(String::from("")),
            pub_date: entry.published.map(|dt| dt.naive_utc()),
            description: crate::core::common::remove_html_tags(
                Some(entry.summary.unwrap_or_default().value).clone(),
            ),
            content: entry.content.and_then(|content| content.value),
            read_later: 0,
            read: 0,
            hide: 0,
            author: Some(feed.title.clone()), // author: Some(entry.authors.into_iter().nth(0).unwrap().name),
            external_id: None,
            entry_type: feed.default_entry_type.clone(),
            content_type: String::from("text/html"),
        }
    }
}
