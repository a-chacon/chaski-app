CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    title TEXT,
    link TEXT NOT NULL,
    image TEXT,
    pub_date DATETIME,
    description TEXT,
    content TEXT,
    read_later INTEGER NOT NULL,
    read INTEGER NOT NULL,
    hide INTEGER NOT NULL,
    author TEXT,
    feed_id INTEGER NOT NULL REFERENCES feeds(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

