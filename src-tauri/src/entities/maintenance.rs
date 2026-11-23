use crate::db::{database_file_size, establish_connection};
use diesel::connection::SimpleConnection;
use diesel::prelude::*;
use diesel::sql_query;
use diesel::sql_types::BigInt;
use serde::Serialize;
use tokio::time::{sleep, Duration};

const CONFIG_NAME: &str = "MAX_DATABASE_SIZE_MB";
const PURGE_INTERVAL: Duration = Duration::from_secs(6 * 60 * 60);
/// After purging we aim below the limit so the next runs don't purge again immediately.
const TARGET_RATIO: f64 = 0.9;
/// Entries newer than this are never purged, so a tiny limit can't wipe recent content.
const MIN_AGE_DAYS: i64 = 7;
const DELETE_BATCH_SIZE: i64 = 500;
const VACUUM_MIN_FREE_RATIO: f64 = 0.2;
const VACUUM_MIN_FREE_BYTES: i64 = 1024 * 1024;

#[derive(QueryableByName)]
struct PageStats {
    #[diesel(sql_type = BigInt)]
    pages: i64,
    #[diesel(sql_type = BigInt)]
    page_size: i64,
    #[diesel(sql_type = BigInt)]
    free_pages: i64,
}

#[derive(QueryableByName)]
struct Count {
    #[diesel(sql_type = BigInt)]
    count: i64,
}

#[derive(Serialize, Debug)]
pub struct StorageUsage {
    pub database_bytes: u64,
    pub free_bytes: u64,
    pub entries_count: i64,
}

fn page_stats(conn: &mut SqliteConnection) -> QueryResult<PageStats> {
    sql_query(
        "SELECT (SELECT page_count FROM pragma_page_count()) AS pages, \
                (SELECT page_size FROM pragma_page_size()) AS page_size, \
                (SELECT freelist_count FROM pragma_freelist_count()) AS free_pages",
    )
    .get_result(conn)
}

fn entries_count(conn: &mut SqliteConnection) -> QueryResult<i64> {
    sql_query("SELECT COUNT(*) AS count FROM entries")
        .get_result::<Count>(conn)
        .map(|c| c.count)
}

pub fn storage_usage(app_handle: &tauri::AppHandle) -> Result<StorageUsage, String> {
    let conn = &mut establish_connection(app_handle);
    let stats = page_stats(conn).map_err(|e| e.to_string())?;
    let count = entries_count(conn).map_err(|e| e.to_string())?;

    Ok(StorageUsage {
        database_bytes: database_file_size(app_handle),
        free_bytes: (stats.free_pages * stats.page_size).max(0) as u64,
        entries_count: count,
    })
}

fn max_size_mb(conn: &mut SqliteConnection) -> i64 {
    use crate::schema::configurations::dsl::*;

    configurations
        .filter(name.eq(CONFIG_NAME))
        .select(value)
        .first::<String>(conn)
        .ok()
        .and_then(|v| v.trim().parse::<i64>().ok())
        .unwrap_or(0)
}

/// Purges old entries until the live data size is under the configured limit
/// (0 = unlimited). Returns the number of deleted entries.
pub fn purge_if_needed(app_handle: &tauri::AppHandle) -> Result<usize, String> {
    let conn = &mut establish_connection(app_handle);
    let max_mb = max_size_mb(conn);

    // Always prune the (unused) changes log, it is cheap.
    let _ = conn.batch_execute("DELETE FROM changes WHERE timestamp < datetime('now', '-30 days')");

    if max_mb <= 0 {
        return Ok(0);
    }

    let max_bytes = max_mb * 1024 * 1024;
    let stats = page_stats(conn).map_err(|e| e.to_string())?;
    let live_bytes = (stats.pages - stats.free_pages) * stats.page_size;

    if live_bytes <= max_bytes {
        return Ok(0);
    }

    let total = entries_count(conn).map_err(|e| e.to_string())?;
    if total == 0 {
        return Ok(0);
    }

    let target_bytes = (max_bytes as f64 * TARGET_RATIO) as i64;
    let avg_entry_bytes = (live_bytes / total).max(1);
    let mut remaining = ((live_bytes - target_bytes) / avg_entry_bytes + 1).min(total);
    let mut deleted_total = 0usize;

    // Read entries go first, then unread ones, oldest first. Read-later and recent entries are kept.
    while remaining > 0 {
        let batch = remaining.min(DELETE_BATCH_SIZE);
        let deleted = crate::db::with_retry(|| {
            sql_query(
                "DELETE FROM entries WHERE id IN ( \
                   SELECT id FROM entries \
                   WHERE read_later = 0 \
                     AND COALESCE(pub_date, created_at) < datetime('now', '-' || ? || ' days') \
                   ORDER BY read DESC, COALESCE(pub_date, created_at) ASC \
                   LIMIT ?)",
            )
            .bind::<BigInt, _>(MIN_AGE_DAYS)
            .bind::<BigInt, _>(batch)
            .execute(conn)
        })?;

        if deleted == 0 {
            break;
        }
        deleted_total += deleted;
        remaining -= deleted as i64;
        // Yield the write lock between batches so feed updates are not starved.
        std::thread::sleep(Duration::from_millis(50));
    }

    log::info!(target: "chaski:maintenance", "Purged {deleted_total} entries (limit {max_mb} MB).");

    if deleted_total > 0 {
        reclaim_space(conn);
    }

    Ok(deleted_total)
}

fn reclaim_space(conn: &mut SqliteConnection) {
    let _ = conn.batch_execute("PRAGMA wal_checkpoint(TRUNCATE)");

    if let Ok(stats) = page_stats(conn) {
        let free_bytes = stats.free_pages * stats.page_size;
        if stats.pages > 0
            && free_bytes >= VACUUM_MIN_FREE_BYTES
            && stats.free_pages as f64 / stats.pages as f64 >= VACUUM_MIN_FREE_RATIO
        {
            if let Err(e) = conn.batch_execute("VACUUM") {
                log::error!(target: "chaski:maintenance", "VACUUM failed: {e}");
            }
            let _ = conn.batch_execute("PRAGMA wal_checkpoint(TRUNCATE)");
        }
    }
}

pub fn spawn_maintenance_loop(app_handle: tauri::AppHandle) {
    tauri::async_runtime::spawn(async move {
        sleep(Duration::from_secs(30)).await;
        loop {
            let handle = app_handle.clone();
            let result =
                tauri::async_runtime::spawn_blocking(move || purge_if_needed(&handle)).await;
            if let Ok(Err(e)) = result {
                log::error!(target: "chaski:maintenance", "Purge failed: {e}");
            }
            sleep(PURGE_INTERVAL).await;
        }
    });
}
