// @generated automatically by Diesel CLI.

diesel::table! {
    accounts (id) {
        id -> Integer,
        name -> Text,
        kind -> Text,
        auth_token -> Nullable<Text>,
        credentials -> Nullable<Text>,
        server_url -> Nullable<Text>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    changes (id) {
        id -> Nullable<Integer>,
        table_name -> Text,
        record_id -> Integer,
        change_type -> Text,
        timestamp -> Timestamp,
    }
}

diesel::table! {
    configurations (id) {
        id -> Integer,
        name -> Text,
        value -> Text,
        kind -> Text,
        updated_at -> Timestamp,
        created_at -> Timestamp,
    }
}

diesel::table! {
    entries (id) {
        id -> Integer,
        title -> Nullable<Text>,
        link -> Text,
        thumbnail -> Nullable<Text>,
        pub_date -> Nullable<Timestamp>,
        description -> Nullable<Text>,
        content -> Nullable<Text>,
        read_later -> Integer,
        read -> Integer,
        hide -> Integer,
        author -> Nullable<Text>,
        feed_id -> Integer,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        external_id -> Nullable<Text>,
        entry_type -> Text,
        media_content_url -> Nullable<Text>,
        media_content_type -> Nullable<Text>,
    }
}

diesel::table! {
    entry_tags (tag_id, entry_id) {
        id -> Integer,
        tag_id -> Integer,
        entry_id -> Integer,
    }
}

diesel::table! {
    feeds (id) {
        id -> Integer,
        title -> Text,
        description -> Text,
        link -> Text,
        icon -> Nullable<Text>,
        last_fetch -> Nullable<Timestamp>,
        latest_entry -> Nullable<Timestamp>,
        kind -> Text,
        items_count -> Nullable<Integer>,
        folder -> Nullable<Text>,
        proxy -> Text,
        entry_limit -> Integer,
        history_limit -> Integer,
        update_interval_minutes -> Integer,
        notifications_enabled -> Integer,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        account_id -> Nullable<Integer>,
        external_id -> Nullable<Text>,
        default_entry_type -> Text,
    }
}

diesel::table! {
    filters (id) {
        id -> Integer,
        field -> Text,
        operator -> Text,
        value -> Text,
        logical_operator -> Text,
        feed_id -> Integer,
        updated_at -> Timestamp,
        created_at -> Timestamp,
    }
}

diesel::table! {
    tags (id) {
        id -> Nullable<Integer>,
        value -> Text,
        entry_id -> Integer,
    }
}

diesel::joinable!(entries -> feeds (feed_id));
diesel::joinable!(entry_tags -> entries (entry_id));
diesel::joinable!(entry_tags -> tags (tag_id));
diesel::joinable!(feeds -> accounts (account_id));
diesel::joinable!(filters -> feeds (feed_id));

diesel::allow_tables_to_appear_in_same_query!(
    accounts,
    changes,
    configurations,
    entries,
    entry_tags,
    feeds,
    filters,
    tags,
);
