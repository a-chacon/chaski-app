CREATE TABLE configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT "GLOBAL",
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO configurations (
  name, value, kind
) VALUES ( 'INDEX_ARTICLES_LAYOUT', 'LIST', "LOCAL");

INSERT INTO configurations (
  name, value, kind
) VALUES ( 'THEME_MODE', 'AUTO', "LOCAL");

INSERT INTO configurations (
  name, value, kind
) VALUES ( 'APP_FONT', 'font-arial', "LOCAL");

INSERT INTO configurations (
  name, value, kind
) VALUES ( 'APP_FONT_SIZE', '16', "LOCAL");

INSERT INTO configurations (
  name, value, kind
) VALUES ( 'APP_FONT_SPACE', '0', "LOCAL");

INSERT INTO configurations (
  name, value, kind
) VALUES ( 'MARK_AS_READ_ON_HOVER', 'false', "LOCAL");

