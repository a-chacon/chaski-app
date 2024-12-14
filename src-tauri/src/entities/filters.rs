use crate::db::establish_connection;
use crate::models::{Filter, NewArticle, NewFilter};
use crate::schema::filters::dsl::*;
use diesel::prelude::*;
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct FilterFilters {
    pub feed_id_eq: Option<i32>,
}

pub fn index(filter_filters: Option<FilterFilters>, app_handle: tauri::AppHandle) -> Vec<Filter> {
    let mut query = filters
        .select(Filter::as_select())
        .order(logical_operator.desc())
        .into_boxed();

    if let Some(filter_filter) = filter_filters {
        if let Some(feed_id_eq) = filter_filter.feed_id_eq {
            query = query.filter(feed_id.eq(feed_id_eq));
        }
    }

    query
        .load(&mut establish_connection(&app_handle))
        .expect("Error loading Filters")
}

pub fn apply_filters(articles: Vec<NewArticle>, filters_to_apply: Vec<Filter>) -> Vec<NewArticle> {
    articles
        .into_iter()
        .filter(|new_article| {
            let mut results = Vec::new();
            for (i, filter) in filters_to_apply.iter().enumerate() {
                let matches = matches_filter(new_article, filter);
                results.push(matches);

                if i < filters_to_apply.len() - 1 {
                    match filter.logical_operator.as_str() {
                        "AND" => {
                            if !matches {
                                return false; // Short-circuit: if any filter fails, skip the item
                            }
                        }
                        "OR" => {
                            if matches {
                                return true; // Short-circuit: if any filter passes, keep the item
                            }
                        }
                        _ => {}
                    }
                }
            }

            results.iter().all(|&result| result)
        })
        .collect()
}

fn matches_filter(article: &NewArticle, filter: &Filter) -> bool {
    let field_value = match filter.field.as_str() {
        "LINK" => Some(article.link.as_str()),
        "TITLE" => article.title.as_deref(),
        "DESCRIPTION" => article.description.as_deref(),
        _ => None,
    };

    let value_to_check = field_value.unwrap_or("");

    match filter.operator.as_str() {
        "CONTAINS" => value_to_check.contains(&filter.value),
        "NO_CONTAINS" => !value_to_check.contains(&filter.value),
        "STARTS_WITH" => value_to_check.starts_with(&filter.value),
        "ENDS_WITH" => value_to_check.ends_with(&filter.value),
        _ => false,
    }
}

pub fn create(new_filter: NewFilter, app_handle: tauri::AppHandle) -> Filter {
    use crate::schema::filters;

    diesel::insert_into(filters::table)
        .values(&new_filter)
        .returning(Filter::as_returning())
        .get_result(&mut establish_connection(&app_handle))
        .expect("Error saving new post")
}

pub fn update(filter_id: i32, filter: Filter, app_handle: tauri::AppHandle) -> Filter {
    diesel::update(filters.find(filter_id))
        .set(filter)
        .returning(Filter::as_returning())
        .get_result(&mut establish_connection(&app_handle))
        .expect("Update filter")
}

pub fn destroy(filter_id: i32, app_handle: tauri::AppHandle) {
    let conn = &mut establish_connection(&app_handle);

    let _ = diesel::delete(filters.filter(id.eq(filter_id))).execute(conn);
}
