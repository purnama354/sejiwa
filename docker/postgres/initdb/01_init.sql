-- Enable useful extensions (safe to rerun)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Optional: if using trigram search later
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- No schema creation needed: GORM will create tables.
