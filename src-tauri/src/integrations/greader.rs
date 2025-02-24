use crate::models::{Feed, NewFeed};
use reqwest::Client;
use serde::Deserialize;
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
struct GReaderSubscription {
    id: String,
    title: String,
    categories: Vec<GReaderCategory>,
    url: String,
    // #[serde(rename = "htmlUrl")]
    // html_url: String,
    #[serde(rename = "iconUrl")]
    icon_url: String,
}

#[derive(Debug, Deserialize)]
struct GReaderCategory {
    // id: String,
    label: String,
}

#[derive(Debug, Deserialize)]
struct GReaderSubscriptionList {
    subscriptions: Vec<GReaderSubscription>,
}

pub struct GReaderClient {
    pub client: Client,
    pub server_url: String,
    pub auth_token: String,
}

impl GReaderClient {
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
            // #[serde(rename = "streamName")]
            // stream_name: String,
            #[serde(rename = "numResults")]
            num_results: i32,
            // #[serde(rename = "query")]
            // query: String,
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

        let mut params = HashMap::new();
        params.insert("s", old_tag);
        params.insert("dest", new_tag);

        let url = format!("{}/reader/api/0/rename-tag", self.server_url);
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
            .map_err(|e| {
                log::error!("Failed to rename tag: {}", e);
                format!("Failed to rename tag: {}", e)
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            log::error!("Failed to rename tag: {} - {}", status, body);
            return Err(format!("Failed to rename tag: {} - {}", status, body));
        }

        let response_text = response.text().await.map_err(|e| {
            log::error!("Failed to read response: {}", e);
            format!("Failed to read response: {}", e)
        })?;

        if response_text == "OK" {
            Ok(())
        } else {
            log::error!("Failed to rename tag: {}", response_text);
            Err(format!("Failed to rename tag: {}", response_text))
        }
    }

    pub async fn disable_tag(&self, folder_name: &str) -> Result<(), String> {
        let tag = if !folder_name.starts_with("user/-/label/") {
            format!("user/-/label/{}", folder_name)
        } else {
            folder_name.to_string()
        };

        let mut params = HashMap::new();
        params.insert("s", tag);

        let url = format!("{}/reader/api/0/disable-tag", self.server_url);
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
            .map_err(|e| {
                log::error!("Failed to disable tag: {}", e);
                format!("Failed to disable tag: {}", e)
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            log::error!("Failed to disable tag: {} - {}", status, body);
            return Err(format!("Failed to disable tag: {} - {}", status, body));
        }

        let response_text = response.text().await.map_err(|e| {
            log::error!("Failed to read response: {}", e);
            format!("Failed to read response: {}", e)
        })?;

        if response_text == "OK" {
            Ok(())
        } else {
            log::error!("Failed to disable tag: {}", response_text);
            Err(format!("Failed to disable tag: {}", response_text))
        }
    }

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
                    account_id: None,
                    external_id: Some(sub.id),
                    default_entry_type: String::from("article"),
                }
            })
            .collect();

        Ok(feeds)
    }
}
