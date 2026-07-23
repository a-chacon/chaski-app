use chrono::{DateTime, NaiveDate, NaiveDateTime, TimeZone, Utc};
use regex::Regex;
use std::option::Option;

pub fn parse_date_to_utc(pub_date: &str) -> Option<DateTime<Utc>> {
    let date_str = pub_date.trim();

    // Common RSS/Atom formats first.
    if let Ok(dt) = DateTime::parse_from_rfc2822(date_str) {
        return Some(dt.with_timezone(&Utc));
    }

    if let Ok(dt) = DateTime::parse_from_rfc3339(date_str) {
        return Some(dt.with_timezone(&Utc));
    }

    // Normalize timezone abbreviations often seen in RSS (e.g. "UTC", "GMT").
    let normalized = date_str
        .strip_suffix(" UTC")
        .map(|s| format!("{s} +0000"))
        .or_else(|| date_str.strip_suffix(" GMT").map(|s| format!("{s} +0000")));

    if let Some(normalized_date) = normalized {
        if let Ok(dt) = DateTime::parse_from_str(&normalized_date, "%a, %d %b %Y %H:%M:%S %z") {
            return Some(dt.with_timezone(&Utc));
        }
        if let Ok(dt) = DateTime::parse_from_str(&normalized_date, "%d %b %Y %H:%M:%S %z") {
            return Some(dt.with_timezone(&Utc));
        }
    }

    // Fallbacks for timezone-less values. We assume UTC.
    for format in [
        "%a, %d %b %Y %H:%M:%S",
        "%d %b %Y %H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
    ] {
        if let Ok(naive_dt) = NaiveDateTime::parse_from_str(date_str, format) {
            return Some(Utc.from_utc_datetime(&naive_dt));
        }
    }

    if let Ok(naive_date) = NaiveDate::parse_from_str(date_str, "%Y-%m-%d") {
        if let Some(naive_dt) = naive_date.and_hms_opt(0, 0, 0) {
            return Some(Utc.from_utc_datetime(&naive_dt));
        }
    }

    None
}

pub fn parse_rfc822_to_naive_datetime(pub_date: Option<String>) -> Option<NaiveDateTime> {
    pub_date
        .as_deref()
        .and_then(parse_date_to_utc)
        .map(|dt| dt.naive_utc())
}

pub fn remove_html_tags(input: Option<String>) -> Option<String> {
    match input {
        Some(text) => {
            let re = Regex::new(r"<[^>]*>").unwrap();
            Some(re.replace_all(&text, "").to_string())
        }
        None => None,
    }
}

pub fn calculate_default_fetch_interval(
    pub_dates: &[DateTime<Utc>],
    min_interval_minutes: i32,
    max_interval_minutes: i32,
) -> i32 {
    if pub_dates.len() < 2 {
        return max_interval_minutes;
    }

    let first = &pub_dates[0];
    let last = &pub_dates[pub_dates.len() - 1];

    let duration = first.signed_duration_since(*last);
    let total_minutes = duration.num_minutes() as f64;

    let average_interval = total_minutes / (pub_dates.len() - 1) as f64;

    let adjusted_interval = average_interval
        .max(min_interval_minutes as f64)
        .min(max_interval_minutes as f64);

    adjusted_interval as i32
}
