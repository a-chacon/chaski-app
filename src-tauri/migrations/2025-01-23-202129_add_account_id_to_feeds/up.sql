ALTER TABLE feeds
ADD COLUMN account_id INTEGER REFERENCES accounts(id);

UPDATE feeds
SET account_id = 1
WHERE account_id IS NULL;
