CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    kind TEXT NOT NULL,
    auth_token TEXT,
    credentials TEXT,
    server_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO accounts (name, kind, auth_token, credentials, server_url, created_at, updated_at)
VALUES ('Local RSS Account', 'local', NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

