use scraper::{Html, Selector};
use std::io::Cursor;

pub fn extract_title(html_content: &str) -> Option<String> {
    let document = Html::parse_document(html_content);

    let og_title_selector = Selector::parse(r#"meta[property="og:title"]"#).unwrap();
    let twitter_title_selector = Selector::parse(r#"meta[name="twitter:title"]"#).unwrap();
    let title_selector = Selector::parse("title").unwrap();

    if let Some(element) = document.select(&og_title_selector).next() {
        if let Some(content) = element.value().attr("content") {
            return Some(content.to_string());
        }
    }

    if let Some(element) = document.select(&twitter_title_selector).next() {
        if let Some(content) = element.value().attr("content") {
            return Some(content.to_string());
        }
    }

    if let Some(element) = document.select(&title_selector).next() {
        return Some(
            element
                .text()
                .collect::<Vec<_>>()
                .join("")
                .trim()
                .to_string(),
        );
    }

    None
}

pub fn extract_cover(html_content: &str) -> Option<String> {
    let document = Html::parse_document(html_content);

    let og_image_selector = Selector::parse(r#"meta[property="og:image"]"#).unwrap();
    let twitter_image_selector = Selector::parse(r#"meta[name="twitter:image"]"#).unwrap();
    let img_selector = Selector::parse("img").unwrap();

    // Try to find the Open Graph image
    if let Some(element) = document.select(&og_image_selector).next() {
        if let Some(content) = element.value().attr("content") {
            return Some(content.to_string());
        }
    }

    if let Some(element) = document.select(&twitter_image_selector).next() {
        if let Some(content) = element.value().attr("content") {
            return Some(content.to_string());
        }
    }

    for element in document.select(&img_selector) {
        if let Some(src) = element.value().attr("src") {
            if !src.is_empty() {
                return Some(src.to_string());
            }
        }
    }

    None
}

pub fn extract_description(html_content: &str) -> Option<String> {
    let document = Html::parse_document(html_content);

    let og_description_selector = Selector::parse(r#"meta[property="og:description"]"#).unwrap();
    let twitter_description_selector =
        Selector::parse(r#"meta[name="twitter:description"]"#).unwrap();
    let description_selector = Selector::parse(r#"meta[name="description"]"#).unwrap();

    if let Some(element) = document.select(&og_description_selector).next() {
        if let Some(content) = element.value().attr("content") {
            return Some(content.to_string());
        }
    }

    if let Some(element) = document.select(&twitter_description_selector).next() {
        if let Some(content) = element.value().attr("content") {
            return Some(content.to_string());
        }
    }

    if let Some(element) = document.select(&description_selector).next() {
        if let Some(content) = element.value().attr("content") {
            return Some(content.to_string());
        }
    }

    None
}

pub fn extract_content(html_content: &str, url: &tauri::Url) -> Option<String> {
    let mut reader = Cursor::new(html_content);
    let result = readability::extractor::extract(&mut reader, url);
    match result {
        Ok(product) => Some(product.content),
        Err(_e) => None,
    }
}
