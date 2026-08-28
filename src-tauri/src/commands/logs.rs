use std::io::{Read, Seek, SeekFrom};
use tauri::{command, Manager};

const TAIL_LINES: usize = 500;
const CHUNK_SIZE: u64 = 65_536;

#[command]
pub async fn get_log_content(app_handle: tauri::AppHandle) -> Result<String, String> {
    log::debug!(target: "chaski:commands", "Command get_log_content.");

    let log_dir = app_handle
        .path()
        .app_log_dir()
        .map_err(|e| format!("Could not resolve log directory: {e}"))?;

    // tauri-plugin-log names the file after the productName in tauri.conf.json
    let log_file = log_dir.join("Chaski.log");

    if !log_file.exists() {
        return Ok(String::new());
    }

    let mut file =
        std::fs::File::open(&log_file).map_err(|e| format!("Could not open log file: {e}"))?;

    let file_size = file
        .seek(SeekFrom::End(0))
        .map_err(|e| format!("Could not seek log file: {e}"))?;

    // Read only the last CHUNK_SIZE bytes to avoid loading the whole file
    let read_from = file_size.saturating_sub(CHUNK_SIZE);
    file.seek(SeekFrom::Start(read_from))
        .map_err(|e| format!("Could not seek log file: {e}"))?;

    let mut buf = String::new();
    file.read_to_string(&mut buf)
        .map_err(|e| format!("Could not read log file: {e}"))?;

    // If we seeked into the middle of the file, drop the first (potentially partial) line
    let content = if read_from > 0 {
        buf.find('\n').map(|i| &buf[i + 1..]).unwrap_or(&buf)
    } else {
        &buf
    };

    // Keep only the last TAIL_LINES lines
    let lines: Vec<&str> = content.lines().collect();
    let tail = if lines.len() > TAIL_LINES {
        &lines[lines.len() - TAIL_LINES..]
    } else {
        &lines
    };

    Ok(tail.join("\n"))
}
