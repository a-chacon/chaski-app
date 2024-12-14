PRAGMA journal_mode = WAL;          -- better write-concurrency
PRAGMA synchronous = '1';        -- fsync only in critical moments
PRAGMA wal_autocheckpoint = 1000;   -- write WAL changes back every 1000 pages, for an in average 1MB WAL file. May affect readers if number is increased
PRAGMA wal_checkpoint(TRUNCATE);    -- free some space by truncating possibly massive WAL files from the last run.
PRAGMA busy_timeout = 250;          -- sleep if the database is busy
PRAGMA foreign_keys = ON;           -- enforce foreign keys
