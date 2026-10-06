use crate::models::{Feed, NewEntry, NewFeed};
use reqwest::Client;
use serde::Deserialize;
use std::collections::HashMap;

// ── Subscription list ────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
struct GReaderSubscription {
    id: String,
    title: String,
    categories: Vec<GReaderCategory>,
    url: String,
    #[serde(rename = "iconUrl")]
    icon_url: String,
}

#[derive(Debug, Deserialize)]
struct GReaderCategory {
    label: String,
}

#[derive(Debug, Deserialize)]
struct GReaderSubscriptionList {
    subscriptions: Vec<GReaderSubscription>,
}

// ── Stream item contents ─────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct GReaderItemContent {
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct GReaderItemLink {
    pub href: String,
}

#[derive(Debug, Deserialize)]
pub struct GReaderItemOrigin {
    #[serde(rename = "streamId")]
    pub stream_id: String, // e.g. "feed/https://example.com/feed"
}

#[derive(Debug, Deserialize)]
pub struct GReaderItem {
    pub id: String,
    pub title: Option<String>,
    pub canonical: Option<Vec<GReaderItemLink>>,
    pub alternate: Option<Vec<GReaderItemLink>>,
    pub summary: Option<GReaderItemContent>,
    pub content: Option<GReaderItemContent>,
    pub author: Option<String>,
    pub published: Option<i64>, // unix timestamp
    pub origin: Option<GReaderItemOrigin>,
    pub categories: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
struct GReaderItemsResponse {
    items: Vec<GReaderItem>,
}

// ── Client ───────────────────────────────────────────────────────────────────

pub struct GReaderClient {
    pub client: Client,
    pub server_url: String,
    pub auth_token: String,
}

impl GReaderClient {
    // ── Auth ─────────────────────────────────────────────────────────────────

    pub async fn login(server_url: &str, username: &str, password: &str) -> Result<Self, String> {
        let client = Client::new();

        let login_url = format!(
            "{}/accounts/ClientLogin?Email={}&Passwd={}",
            server_url, username, password
        );

        let response = client
            .post(&login_url)
            .send()
            .await
            .map_err(|e| format!("API request failed: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("Login failed with status: {}", response.status()));
        }

        let response_text = response
            .text()
            .await
            .map_err(|e| format!("Failed to read response: {}", e))?;

        let mut params = HashMap::new();
        for line in response_text.lines() {
            if let Some((key, value)) = line.split_once('=') {
                params.insert(key.to_string(), value.to_string());
            }
        }

        let auth_token = params
            .get("Auth")
            .ok_or("Missing Auth token in response")?
            .to_string();

        Ok(Self {
            client,
            server_url: server_url.to_string(),
            auth_token,
        })
    }

    pub fn new(server_url: String, auth_token: String) -> Result<Self, String> {
        if server_url.is_empty() || auth_token.is_empty() {
            return Err("Server URL and auth token must not be empty".to_string());
        }

        Ok(Self {
            client: Client::new(),
            server_url,
            auth_token,
        })
    }

    // ── Low-level request helpers ─────────────────────────────────────────────

    pub async fn request(
        &self,
        endpoint: &str,
        params: Option<HashMap<&str, &str>>,
    ) -> Result<String, String> {
        let url = format!("{}/{}", self.server_url, endpoint);

        let mut request = self.client.get(&url).header(
            "Authorization",
            format!("GoogleLogin auth={}", self.auth_token),
        );

        if let Some(params) = params {
            request = request.query(&params);
        }

        let response = request
            .send()
            .await
            .map_err(|e| format!("API request failed: {}", e))?;

        if !response.status().is_success() {
            return Err(format!(
                "API request failed with status: {}",
                response.status()
            ));
        }

        response
            .text()
            .await
            .map_err(|e| format!("Failed to read response: {}", e))
    }

    async fn post_form(&self, endpoint: &str, params: Vec<(&str, &str)>) -> Result<String, String> {
        let url = format!("{}/{}", self.server_url, endpoint);

        let response = self
            .client
            .post(&url)
            .header(
                "Authorization",
                format!("GoogleLogin auth={}", self.auth_token),
            )
            .form(&params)
            .send()
            .await
            .map_err(|e| format!("API request failed: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            return Err(format!("API request failed {}: {}", status, body));
        }

        response
            .text()
            .await
            .map_err(|e| format!("Failed to read response: {}", e))
    }

    // ── Feed subscription CRUD ────────────────────────────────────────────────

    pub async fn get_feeds(&self) -> Result<Vec<NewFeed>, String> {
        let response = self
            .request("reader/api/0/subscription/list?output=json", None)
            .await?;

        let subscriptions: GReaderSubscriptionList = serde_json::from_str(&response)
            .map_err(|e| format!("Failed to parse subscriptions: {}", e))?;

        let feeds = subscriptions
            .subscriptions
            .into_iter()
            .map(|sub| {
                let folder = sub
                    .categories
                    .first()
                    .map(|cat| cat.label.clone())
                    .unwrap_or_default();

                NewFeed {
                    title: sub.title,
                    description: String::new(),
                    link: sub.url,
                    icon: Some(sub.icon_url),
                    last_fetch: None,
                    latest_entry: None,
                    kind: "rss".to_string(),
                    items_count: None,
                    folder: Some(folder),
                    update_interval_minutes: 60,
                    notifications_enabled: 0,
                    account_id: None,
                    external_id: Some(sub.id),
                    default_entry_type: String::from("entry"),
                }
            })
            .collect();

        Ok(feeds)
    }

    pub async fn create_feed(&self, feed: &NewFeed) -> Result<String, String> {
        let mut params = HashMap::new();
        params.insert("quickadd", feed.link.as_str());

        let response = self
            .request("reader/api/0/subscription/quickadd", Some(params))
            .await?;

        #[derive(Debug, Deserialize)]
        struct QuickAddResponse {
            #[serde(rename = "streamId")]
            stream_id: String,
            #[serde(rename = "numResults")]
            num_results: i32,
        }

        let quickadd_response: QuickAddResponse = serde_json::from_str(&response).map_err(|e| {
            log::error!(
                "Failed to parse quickadd response: {} - Response: {}",
                e,
                response
            );
            format!(
                "Failed to parse quickadd response: {} - Response: {}",
                e, response
            )
        })?;

        if quickadd_response.num_results == 0 {
            log::error!("Failed to add feed via quickadd");
            return Err("Failed to add feed via quickadd".to_string());
        }

        if let Some(folder) = &feed.folder {
            let mut edit_params = HashMap::new();
            edit_params.insert("ac", "edit");
            edit_params.insert("s", &quickadd_response.stream_id);
            let folder_param = format!("user/-/label/{}", folder);
            edit_params.insert("a", &folder_param);

            let edit_response = self
                .request("reader/api/0/subscription/edit", Some(edit_params))
                .await?;

            if edit_response != "OK" {
                log::error!("Failed to set folder: {}", edit_response);
                return Err(format!("Failed to set folder: {}", edit_response));
            }
        }

        Ok(quickadd_response.stream_id)
    }

    pub async fn update_feed(&self, feed: &Feed) -> Result<(), String> {
        let mut params = HashMap::new();
        let stream_id = format!("feed/{}", feed.link);
        params.insert("ac", "edit");
        params.insert("s", &stream_id);

        let category: String;
        if let Some(folder) = &feed.folder {
            category = format!("user/-/label/{}", folder);
            params.insert("a", &category);
        } else {
            params.insert("r", "user/-/label/");
        }

        if !feed.title.is_empty() {
            params.insert("t", &feed.title);
        }

        let response = self
            .request("reader/api/0/subscription/edit", Some(params))
            .await?;
        if response == "OK" {
            Ok(())
        } else {
            Err(format!("Failed to update feed: {}", response))
        }
    }

    pub async fn delete_feed(&self, feed_url: &str) -> Result<(), String> {
        let mut params = HashMap::new();
        let stream_id = format!("feed/{}", feed_url);
        params.insert("ac", "unsubscribe");
        params.insert("s", &stream_id);

        let response = self
            .request("reader/api/0/subscription/edit", Some(params))
            .await?;
        if response == "OK" {
            Ok(())
        } else {
            Err(format!("Failed to delete feed: {}", response))
        }
    }

    // ── Folder / tag management ───────────────────────────────────────────────

    pub async fn rename_tag(&self, old_tag: &str, new_tag: &str) -> Result<(), String> {
        let old_tag = if !old_tag.starts_with("user/-/label/") {
            format!("user/-/label/{}", old_tag)
        } else {
            old_tag.to_string()
        };

        let new_tag = if !new_tag.starts_with("user/-/label/") {
            format!("user/-/label/{}", new_tag)
        } else {
            new_tag.to_string()
        };

        let params = vec![("s", old_tag.as_str()), ("dest", new_tag.as_str())];
        let response = self.post_form("reader/api/0/rename-tag", params).await?;

        if response == "OK" {
            Ok(())
        } else {
            log::error!("Failed to rename tag: {}", response);
            Err(format!("Failed to rename tag: {}", response))
        }
    }

    pub async fn disable_tag(&self, folder_name: &str) -> Result<(), String> {
        let tag = if !folder_name.starts_with("user/-/label/") {
            format!("user/-/label/{}", folder_name)
        } else {
            folder_name.to_string()
        };

        let params = vec![("s", tag.as_str())];
        let response = self.post_form("reader/api/0/disable-tag", params).await?;

        if response == "OK" {
            Ok(())
        } else {
            log::error!("Failed to disable tag: {}", response);
            Err(format!("Failed to disable tag: {}", response))
        }
    }

    // ── Entry ID streams ──────────────────────────────────────────────────────

    /// Fetch IDs of unread items across all feeds for this account.
    /// `limit` caps how many we pull (default 25000 is sane for most users).
    pub async fn get_unread_ids(&self, limit: usize) -> Result<Vec<String>, String> {
        self.get_stream_ids(
            "user/-/state/com.google/reading-list",
            Some("user/-/state/com.google/read"),
            limit,
        )
        .await
    }

    /// Fetch IDs of starred items.
    pub async fn get_starred_ids(&self, limit: usize) -> Result<Vec<String>, String> {
        self.get_stream_ids("user/-/state/com.google/starred", None, limit)
            .await
    }

    async fn get_stream_ids(
        &self,
        stream: &str,
        exclude_stream: Option<&str>,
        limit: usize,
    ) -> Result<Vec<String>, String> {
        let limit_str = limit.to_string();
        let mut params = vec![("s", stream), ("n", limit_str.as_str()), ("output", "json")];

        if let Some(xt) = exclude_stream {
            params.push(("xt", xt));
        }

        let mut all_ids = Vec::new();
        let mut continuation: Option<String> = None;

        loop {
            let cont_str;
            let mut page_params = params.clone();
            if let Some(ref c) = continuation {
                cont_str = c.clone();
                page_params.push(("c", cont_str.as_str()));
            }

            let url = format!("{}/reader/api/0/stream/items/ids", self.server_url);
            let response = self
                .client
                .get(&url)
                .header(
                    "Authorization",
                    format!("GoogleLogin auth={}", self.auth_token),
                )
                .query(&page_params)
                .send()
                .await
                .map_err(|e| format!("API request failed: {}", e))?;

            if !response.status().is_success() {
                return Err(format!("Stream IDs request failed: {}", response.status()));
            }

            let body = response
                .text()
                .await
                .map_err(|e| format!("Failed to read response: {}", e))?;

            let parsed: serde_json::Value = serde_json::from_str(&body)
                .map_err(|e| format!("Failed to parse IDs response: {}", e))?;

            // itemRefs may be absent when there are 0 results
            if let Some(refs) = parsed.get("itemRefs").and_then(|v| v.as_array()) {
                for r in refs {
                    if let Some(id) = r.get("id").and_then(|v| v.as_str()) {
                        // Normalize to long form so IDs match what
                        // stream/items/contents returns and what we store.
                        all_ids.push(normalize_item_id(id));
                    }
                }
            }

            // Pagination
            continuation = parsed
                .get("continuation")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());

            if continuation.is_none() || all_ids.len() >= limit {
                break;
            }
        }

        Ok(all_ids)
    }

    // ── Entry contents ────────────────────────────────────────────────────────

    /// Fetch full item contents for a batch of GReader item IDs.
    /// GReader accepts multiple `i=` params in a single POST (up to ~250).
    pub async fn get_items_contents(&self, ids: &[String]) -> Result<Vec<GReaderItem>, String> {
        if ids.is_empty() {
            return Ok(vec![]);
        }

        // Build POST body manually: i=id1&i=id2&...&output=json
        // reqwest .form() doesn't support repeated keys easily, so we build the body string
        let mut body_parts: Vec<String> = ids.iter().map(|id| format!("i={}", id)).collect();
        body_parts.push("output=json".to_string());
        let body = body_parts.join("&");

        let url = format!("{}/reader/api/0/stream/items/contents", self.server_url);
        let response = self
            .client
            .post(&url)
            .header(
                "Authorization",
                format!("GoogleLogin auth={}", self.auth_token),
            )
            .header("Content-Type", "application/x-www-form-urlencoded")
            .body(body)
            .send()
            .await
            .map_err(|e| format!("API request failed: {}", e))?;

        if !response.status().is_success() {
            return Err(format!(
                "Items contents request failed: {}",
                response.status()
            ));
        }

        let text = response
            .text()
            .await
            .map_err(|e| format!("Failed to read response: {}", e))?;

        let parsed: GReaderItemsResponse = serde_json::from_str(&text).map_err(|e| {
            format!(
                "Failed to parse items contents: {} — body: {}",
                e,
                &text[..text.len().min(300)]
            )
        })?;

        Ok(parsed.items)
    }

    // ── Read / starred state ──────────────────────────────────────────────────

    /// Mark items as read on the remote server.
    pub async fn mark_as_read(&self, ids: &[String]) -> Result<(), String> {
        self.edit_tag(ids, Some("user/-/state/com.google/read"), None)
            .await
    }

    /// Mark items as unread on the remote server.
    pub async fn mark_as_unread(&self, ids: &[String]) -> Result<(), String> {
        self.edit_tag(ids, None, Some("user/-/state/com.google/read"))
            .await
    }

    /// Mark items as starred (saved for later).
    pub async fn mark_as_starred(&self, ids: &[String]) -> Result<(), String> {
        self.edit_tag(ids, Some("user/-/state/com.google/starred"), None)
            .await
    }

    /// Remove starred tag from items.
    pub async fn mark_as_unstarred(&self, ids: &[String]) -> Result<(), String> {
        self.edit_tag(ids, None, Some("user/-/state/com.google/starred"))
            .await
    }

    /// Low-level edit-tag: add or remove a tag from a list of item IDs.
    /// Both `add` and `remove` are optional, but at least one should be Some.
    pub async fn edit_tag(
        &self,
        ids: &[String],
        add: Option<&str>,
        remove: Option<&str>,
    ) -> Result<(), String> {
        if ids.is_empty() {
            return Ok(());
        }

        // Build body: i=id1&i=id2&a=tag or r=tag
        let mut body_parts: Vec<String> = ids.iter().map(|id| format!("i={}", id)).collect();
        if let Some(a) = add {
            body_parts.push(format!("a={}", a));
        }
        if let Some(r) = remove {
            body_parts.push(format!("r={}", r));
        }
        let body = body_parts.join("&");

        let url = format!("{}/reader/api/0/edit-tag", self.server_url);
        let response = self
            .client
            .post(&url)
            .header(
                "Authorization",
                format!("GoogleLogin auth={}", self.auth_token),
            )
            .header("Content-Type", "application/x-www-form-urlencoded")
            .body(body)
            .send()
            .await
            .map_err(|e| format!("edit-tag request failed: {}", e))?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            return Err(format!("edit-tag failed {}: {}", status, body));
        }

        Ok(())
    }
}

// ── Item ID normalization ─────────────────────────────────────────────────────

/// Convert any GReader item ID to the canonical long form:
/// `tag:google.com,2005:reader/item/XXXXXXXXXXXXXXXX` (16 hex digits).
///
/// `stream/items/ids` returns short signed-decimal form (e.g. `"344691561"`).
/// `stream/items/contents` returns the long form.
/// Both forms represent the same item; we normalise to long for storage.
pub fn normalize_item_id(id: &str) -> String {
    if id.starts_with("tag:google.com,2005:reader/item/") {
        return id.to_string();
    }
    // Short form: signed base-10 integer
    if let Ok(n) = id.parse::<i64>() {
        // Reinterpret the signed bits as unsigned for the hex representation
        let u = n as u64;
        return format!("tag:google.com,2005:reader/item/{:016x}", u);
    }
    // Unknown format — return as-is
    id.to_string()
}

// ── GReaderItem → NewEntry conversion ────────────────────────────────────────

/// Convert a GReader API item into a NewEntry, given the matching local feed_id.
pub fn greader_item_to_new_entry(item: &GReaderItem, feed_id: i32) -> NewEntry {
    let pub_date = item
        .published
        .and_then(|ts| chrono::DateTime::from_timestamp(ts, 0))
        .map(|dt| dt.naive_utc());

    let link = item
        .canonical
        .as_ref()
        .and_then(|v| v.first())
        .map(|l| l.href.clone())
        .or_else(|| {
            item.alternate
                .as_ref()
                .and_then(|v| v.first())
                .map(|l| l.href.clone())
        })
        .unwrap_or_default();

    let content = item
        .content
        .as_ref()
        .map(|c| c.content.clone())
        .or_else(|| item.summary.as_ref().map(|s| s.content.clone()));

    // Categories are strings like "user/-/state/com.google/read" or
    // "user/USERID/state/com.google/starred". Match by suffix to handle
    // both the canonical "-" form and real user-ID forms.
    let is_read = item
        .categories
        .as_ref()
        .map(|cats| {
            cats.iter().any(|c| {
                // Must end with /read but NOT /read-later (avoid false match)
                (c.ends_with("/state/com.google/read") || c.contains("/state/com.google/read"))
                    && !c.contains("read-later")
            })
        })
        .unwrap_or(false);

    let is_starred = item
        .categories
        .as_ref()
        .map(|cats| cats.iter().any(|c| c.contains("/state/com.google/starred")))
        .unwrap_or(false);

    log::debug!(
        target: "chaski:sync",
        "Item {} categories: {:?} → read={} starred={}",
        item.id,
        item.categories,
        is_read,
        is_starred
    );

    let read = is_read as i32;
    let read_later = is_starred as i32;

    NewEntry {
        feed_id,
        title: item.title.clone(),
        link,
        thumbnail: None,
        pub_date,
        description: None,
        content,
        read_later,
        read,
        hide: 0,
        author: item.author.clone(),
        external_id: Some(item.id.clone()),
        entry_type: String::from("entry"),
        media_content_url: None,
        media_content_type: None,
    }
}
