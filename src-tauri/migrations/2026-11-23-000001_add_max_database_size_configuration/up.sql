INSERT INTO configurations (name, value, kind)
SELECT 'MAX_DATABASE_SIZE_MB', '1024', 'LOCAL'
WHERE NOT EXISTS (
  SELECT 1 FROM configurations WHERE name = 'MAX_DATABASE_SIZE_MB'
);
