INSERT INTO configurations (name, value, kind)
SELECT 'ARTICLE_SCRAPE_MODE', 'ON_DEMAND', 'LOCAL'
WHERE NOT EXISTS (
  SELECT 1 FROM configurations WHERE name = 'ARTICLE_SCRAPE_MODE'
);
