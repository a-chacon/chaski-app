CREATE TABLE article_tags (
    id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    FOREIGN KEY (article_id) REFERENCES articles(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id),
    PRIMARY KEY (article_id, tag_id)
);

