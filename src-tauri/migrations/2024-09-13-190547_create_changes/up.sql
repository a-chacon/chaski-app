CREATE TABLE changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,  -- or UUID, depending on your ID scheme
    change_type TEXT NOT NULL,  -- 'insert', 'update', 'delete'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);
