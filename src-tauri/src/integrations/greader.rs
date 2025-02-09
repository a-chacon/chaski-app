use crate::models::NewFeed;
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
                }
            })
            .collect();

        Ok(feeds)
    }
}
