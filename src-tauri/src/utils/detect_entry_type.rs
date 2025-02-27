use regex::Regex;
use reqwest::Url;

struct EntryTypePattern {
    regex: Regex,
    entry_type: &'static str,
}

impl EntryTypePattern {
    fn new(pattern: &str, entry_type: &'static str) -> Self {
        Self {
            regex: Regex::new(pattern).unwrap(),
            entry_type,
        }
    }

    fn matches(&self, text: &str) -> bool {
        self.regex.is_match(text)
    }
}

struct EntryTypeDetector {
    patterns: Vec<EntryTypePattern>,
    default_type: &'static str,
}

impl EntryTypeDetector {
    fn new() -> Self {
        let patterns = vec![
            EntryTypePattern::new(r"(@[^/]+\.rss)", "microblog"),
            EntryTypePattern::new(r"(twitter\.com|x\.com|nitter\.net|bsky\.app)", "microblog"),
            EntryTypePattern::new(r"(instagram\.com|pixelfed\.social|pixelfed\.org)", "image"),
            EntryTypePattern::new(r"(youtube\.com|youtu\.be|vimeo\.com)", "video"),
            EntryTypePattern::new(r"/status/|/post/", "microblog"),
            EntryTypePattern::new(r"/photo/|/image/", "image"),
            EntryTypePattern::new(r"/video/|/watch", "video"),
        ];

        Self {
            patterns,
            default_type: "article",
        }
    }

    fn detect(&self, link: &str) -> &'static str {
        for pattern in &self.patterns {
            if pattern.matches(link) {
                return pattern.entry_type;
            }
        }

        if let Ok(url) = Url::parse(link) {
            if let Some(host) = url.host_str() {
                for pattern in &self.patterns {
                    if pattern.matches(host) {
                        return pattern.entry_type;
                    }
                }
            }
        }

        self.default_type
    }
}

pub fn detect_entry_type(link: &str) -> &'static str {
    let detector = EntryTypeDetector::new();
    detector.detect(link)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_entry_type() {
        // Test social media patterns
        assert_eq!(
            detect_entry_type("https://twitter.com/user/status/123"),
            "microblog"
        );
        assert_eq!(
            detect_entry_type("https://x.com/user/status/123"),
            "microblog"
        );
        assert_eq!(detect_entry_type("https://instagram.com/p/abc123"), "image");
        assert_eq!(
            detect_entry_type("https://pixelfed.social/p/xyz456"),
            "image"
        );
        assert_eq!(
            detect_entry_type("https://youtube.com/watch?v=abc123"),
            "video"
        );
        assert_eq!(detect_entry_type("https://vimeo.com/123456"), "video");

        // Test Mastodon patterns
        assert_eq!(
            detect_entry_type("https://mastodon.social/@user/123"),
            "microblog"
        );
        assert_eq!(
            detect_entry_type("https://example.com/@username.rss"),
            "microblog"
        );
        assert_eq!(
            detect_entry_type("https://mastodon.example.com/users/username"),
            "microblog"
        );

        // Test path-based detection
        assert_eq!(
            detect_entry_type("https://example.com/status/123"),
            "microblog"
        );
        assert_eq!(detect_entry_type("https://example.com/photo/123"), "image");
        assert_eq!(detect_entry_type("https://example.com/video/123"), "video");

        // Test fallback
        assert_eq!(
            detect_entry_type("https://example.com/blog/post"),
            "article"
        );
        assert_eq!(detect_entry_type("invalid-url"), "article");
    }
}
