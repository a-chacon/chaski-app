use crate::models::{Feed, NewArticle, NewFeed};
use chrono::NaiveDateTime;
use reqwest::{
    header::{HeaderMap, HeaderValue, ACCEPT, CACHE_CONTROL, CONNECTION, REFERER, USER_AGENT},
    redirect::Policy,
    Client, Url,
};
use rss::Channel;
use scraper::{Html, Selector};
use std::io::Cursor;
use tokio::time::{sleep, Duration};

use super::article_extractor;

fn create_client() -> Result<Client, Box<dyn std::error::Error>> {
    let mut headers = HeaderMap::new();
    headers.insert(USER_AGENT, HeaderValue::from_static("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"));
    headers.insert(
        ACCEPT,
        HeaderValue::from_static(
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        ),
    );
    headers.insert(REFERER, HeaderValue::from_static("https://google.com/"));
    headers.insert(CONNECTION, HeaderValue::from_static("keep-alive"));
    headers.insert("DNT", HeaderValue::from_static("1"));
    headers.insert(CACHE_CONTROL, HeaderValue::from_static("no-cache"));

    let client = Client::builder()
        .timeout(Duration::from_secs(30))
        .pool_max_idle_per_host(0)
        .redirect(Policy::limited(10))
        .default_headers(headers)
        .build()?;

    Ok(client)
}

async fn fetch_with_retries(
    client: &Client,
    link: &str,
    retries: usize,
) -> Result<reqwest::Response, reqwest::Error> {
    let mut attempts = 0;

    while attempts < retries {
        match client.get(link).send().await {
            Ok(response) => return Ok(response),
            Err(err) => {
                println!("Error: {:?}", err);
                attempts += 1;
                if attempts >= retries {
                    return Err(err);
                }
                sleep(Duration::from_secs(2)).await;
            }
        }
    }

    unreachable!()
}

pub async fn scrape_site_feeds(link: String) -> Result<Vec<NewFeed>, Box<dyn std::error::Error>> {
    let client = create_client()?;
    let response = fetch_with_retries(&client, link.as_str(), 3).await?;

    let mut new_feeds = Vec::new();

    if !response.status().is_success() {
        return Ok(Vec::new());
    }

    let body_bytes = response.bytes().await?;
    let body = String::from_utf8_lossy(&body_bytes);

    if body.contains("<rss") {
        add_rss_feed(&body_bytes, &mut new_feeds, &link)?;
    } else if body.contains("<feed") {
        add_atom_feed(&body_bytes, &mut new_feeds, &link)?;
    } else if body.contains("<html") {
        extract_feeds_from_html(body.to_string(), &mut new_feeds, &link).await?;
    }

    if new_feeds.is_empty() {
        autodiscover_feeds(&link, &mut new_feeds).await?;
    }

    Ok(new_feeds)
}

fn add_rss_feed(
    body_bytes: &[u8],
    new_feeds: &mut Vec<NewFeed>,
    link: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let channel = Channel::read_from(body_bytes)?;
    let mut new_feed = NewFeed::from(channel);
    new_feed.link = String::from(link);

    if new_feed.icon.is_none() {
        //TODO: this should be an scrape to the base url
        let body_str = String::from_utf8_lossy(body_bytes);
        new_feed.icon = Some(parse_html_for_favicon(&body_str, link));
    }

    new_feeds.push(new_feed);
    Ok(())
}

fn add_atom_feed(
    body_bytes: &[u8],
    new_feeds: &mut Vec<NewFeed>,
    link: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let feed = atom_syndication::Feed::read_from(body_bytes)?;
    let mut new_feed = NewFeed::from(feed);

    new_feed.link = String::from(link);
    if new_feed.icon.is_none() {
        //TODO: this should be an scrape to the base url
        let body_str = String::from_utf8_lossy(body_bytes);
        new_feed.icon = Some(parse_html_for_favicon(&body_str, link));
    }

    new_feeds.push(new_feed);
    Ok(())
}

async fn extract_feeds_from_html(
    body: String,
    new_feeds: &mut Vec<NewFeed>,
    link: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let hrefs = parse_html_for_feeds(&body);

    for href in hrefs {
        let href_url = Url::parse(&href).or_else(|_| Url::parse(&format!("{}/{}", link, href)))?;

        let client = create_client()?;
        let feed_response = client.get(href_url.clone()).send().await?;

        if feed_response.status().is_success() {
            let feed_body_bytes = feed_response.bytes().await?;
            let feed_body_str = String::from_utf8_lossy(&feed_body_bytes);

            if feed_body_str.contains("<rss") {
                add_rss_feed(&feed_body_bytes, new_feeds, href_url.as_str())?;
            } else if feed_body_str.contains("<feed") {
                add_atom_feed(&feed_body_bytes, new_feeds, href_url.as_str())?;
            }
        }
    }

    Ok(())
}

fn parse_html_for_feeds(body: &str) -> Vec<String> {
    let document = Html::parse_document(body);
    let selector = Selector::parse("link").unwrap();
    let mut hrefs = Vec::new();

    for element in document.select(&selector) {
        if let Some(link_type) = element.value().attr("type") {
            if link_type == "application/rss+xml" || link_type == "application/atom+xml" {
                if let Some(href) = element.value().attr("href") {
                    hrefs.push(href.to_string());
                }
            }
        }
    }

    hrefs
}

fn parse_html_for_favicon(body: &str, base_url: &str) -> String {
    let document = Html::parse_document(body);
    let selector = Selector::parse("link").unwrap();

    // Try to find the favicon in the HTML
    for element in document.select(&selector) {
        if let Some(rel) = element.value().attr("rel") {
            if rel == "icon" || rel == "shortcut icon" {
                if let Some(href) = element.value().attr("href") {
                    // Resolve the URL
                    if let Ok(base) = Url::parse(base_url) {
                        if let Ok(full_url) = base.join(href) {
                            return full_url.to_string(); // Return the found favicon URL
                        }
                    }
                }
            }
        }
    }

    // If no favicon was found, return the default favicon URL
    if let Ok(base) = Url::parse(base_url) {
        return base.join("/favicon.ico").unwrap().to_string();
    }

    // Fallback in case of a parse error (should not happen with valid base URLs)
    String::from("/favicon.ico")
}

async fn autodiscover_feeds(
    link: &str,
    new_feeds: &mut Vec<NewFeed>,
) -> Result<(), Box<dyn std::error::Error>> {
    let possible_paths = ["/feed/", "/rss/", "/feed.xml", "/index.xml", "/feed.rss"];
    let client = create_client()?;

    for path in &possible_paths {
        // Check the feed path
        let feed_url = format!("{}{}", link, path);

        let feed_response = client.get(&feed_url).send().await?;

        if feed_response.status().is_success() {
            let feed_body_bytes = feed_response.bytes().await?;
            let feed_body_str = String::from_utf8_lossy(&feed_body_bytes);
            let feed_url_str = feed_url.as_str();

            if feed_body_str.contains("<rss") {
                add_rss_feed(&feed_body_bytes, new_feeds, feed_url_str)?;
            } else if feed_body_str.contains("<feed") {
                add_atom_feed(&feed_body_bytes, new_feeds, feed_url_str)?;
            }
        }

        // Check the root path
        if let Ok(root_url) = Url::parse(&feed_url).and_then(|url| url.join("/")) {
            let root_response = client.get(root_url.clone()).send().await?;

            if root_response.status().is_success() {
                let root_body_bytes = root_response.bytes().await?;
                let root_body_str = String::from_utf8_lossy(&root_body_bytes);
                let root_url_str = root_url.as_str();

                if root_body_str.contains("<rss") {
                    add_rss_feed(&root_body_bytes, new_feeds, root_url_str)?;
                } else if root_body_str.contains("<feed") {
                    add_atom_feed(&root_body_bytes, new_feeds, root_url_str)?;
                }
            }
        }
    }

    Ok(())
}

pub async fn scrape_feed_articles(
    feed: &Feed,
) -> Result<Vec<NewArticle>, Box<dyn std::error::Error>> {
    let client = create_client()?;
    let feed_response = client.get(&feed.link).send().await?;
    let mut new_articles = Vec::new();

    if feed_response.status().is_success() {
        let feed_body_bytes = feed_response.bytes().await?;
        let feed_body_str = String::from_utf8_lossy(&feed_body_bytes);

        let cursor = Cursor::new(feed_body_bytes.to_vec());

        // TODO: I already detect and save if it is rss or feed

        if feed_body_str.contains("<rss") {
            let channel = Channel::read_from(cursor)?;

            for item in channel.items {
                new_articles.push(NewArticle::from_feed_and_item(feed, item));
            }
        } else if feed_body_str.contains("<feed") {
            let atom_syndication_feed = atom_syndication::Feed::read_from(cursor)?;

            for entry in atom_syndication_feed.entries {
                new_articles.push(NewArticle::from_feed_and_entry(feed, entry))
            }
        }
    }

    new_articles.sort_by(|a, b| {
        let pub_date_a = a.pub_date.unwrap_or(NaiveDateTime::MIN);
        let pub_date_b = b.pub_date.unwrap_or(NaiveDateTime::MIN);

        pub_date_b.cmp(&pub_date_a)
    });

    Ok(new_articles)
}

#[derive(Debug)]
pub struct ActicleData {
    pub title: Option<String>,
    pub description: Option<String>,
    pub image: Option<String>,
    pub content: Option<String>,
}

pub async fn scrape_article_data(url: &str) -> Result<ActicleData, Box<dyn std::error::Error>> {
    let parsed_url = Url::parse(url)?;
    let client = create_client()?;
    let res = client.get(url).send().await?;

    if res.status().is_success() {
        let body = res.text().await?;

        Ok(ActicleData {
            title: article_extractor::extract_title(&body),
            description: article_extractor::extract_description(&body),
            image: article_extractor::extract_cover(&body),
            content: article_extractor::extract_content(&body, &parsed_url),
        })
    } else {
        Ok(ActicleData {
            image: None,
            content: None,
            title: None,
            description: None,
        })
    }
}
