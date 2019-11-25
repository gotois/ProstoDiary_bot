CREATE DATABASE storydb
    WITH
    OWNER = postgres
--    LC_COLLATE = 'en_US.utf8'
--    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
UPDATE pg_database SET encoding = pg_char_to_encoding('UTF8') WHERE datname = 'storydb';
COMMENT ON DATABASE storydb IS 'Local DB';

-- EXTENSION

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION "pgcrypto";
