use chrono::{DateTime, NaiveDateTime, Utc};
use regex::Regex;
use std::option::Option;

pub fn parse_rfc822_to_naive_datetime(pub_date: Option<String>) -> Option<NaiveDateTime> {
    pub_date.and_then(|date_str| {
        // Try to parse the RFC822 date string into a DateTime<Utc>
        DateTime::parse_from_rfc2822(&date_str)
            .ok() // Convert Result to Option
            .map(|dt| dt.naive_utc()) // Convert DateTime<Utc> to NaiveDateTime
    })
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
