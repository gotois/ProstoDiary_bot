--
-- Create DB
--
-- FIXME: создать роль бота
-- CREATE ROLE bot LOGIN;

-- Warning! Set UTF-8 encoding: https://gist.github.com/ffmike/877447
CREATE DATABASE "ProstoDiaryDB"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE "ProstoDiaryDB"
    IS 'Local DB';

--
-- Foods
--

-- Все на 100 гр. продукта
CREATE TABLE IF NOT EXISTS foods (
  id SERIAL PRIMARY KEY,
  title TEXT UNIQUE, -- нужен индекс по этому
  protein NUMERIC (5, 2) default NULL,
  fat NUMERIC (5, 2) default NULL,
  carbohydrate NUMERIC (5, 2) default NULL,
  kcal NUMERIC (5) default NULL
);

-- Хранимая процедура поиска по title мультиязычно
CREATE OR REPLACE FUNCTION to_tsvector_multilang (title Text) RETURNS tsvector AS $$
SELECT to_tsvector('russian', $1) ||
       to_tsvector('english', $1) ||
       to_tsvector('simple', $1)
$$ LANGUAGE sql IMMUTABLE;

-- Полнотекстовый поиск по тайтлу
CREATE INDEX idx_gin_foods ON Foods USING GIN (to_tsvector_multilang(title));

-- История пользователя будет представлена как "процесс"
CREATE TYPE intent AS ENUM (
 'buy',
 'eat',
 'finance',
 'fitness',
 'health',
 'meet',
 'pain',
 'todo',
 'weight',
 'work'
);

-- TODO: переделать схему под приватную и доступную для редактирования только роли бот
--create schema private;
CREATE TABLE IF NOT EXISTS bot_story (
  id BIGSERIAL PRIMARY KEY,
  version VARCHAR(20) NOT NULL, -- аналогична в package.json -нужна для проверки необходимости обновить историю бота
--  sign -- подпись бота. todo: попробвать через `MD5('string');`?
  contact JSONB NOT NULL,
  publisher VARCHAR(100) NOT NULL, -- ссылка на репозиторий аналогична в package.json
  jurisdiction JSONB,
  telegram_user_id integer,
  created_at timestamp default current_timestamp,
  updated_at timestamp default NULL -- дата обновления (билда)
);
--
-- TODO: переделать схему под приватную и доступную для ...?
--
CREATE TABLE IF NOT EXISTS user_story (
  id BIGSERIAL PRIMARY KEY,
  type intent NOT NULL,
  telegram_entry_id integer NOT NULL,
  created_at timestamp default current_timestamp,
  updated_at timestamp default NULL,
  context JSONB
);
-- FIXME: нужен индекс для типа
--CREATE INDEX idx_intent ON user_story USING GIN (type);
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  bot_story_id BIGSERIAL REFERENCES bot_story (id) NOT NULL,
  user_story_id BIGSERIAL REFERENCES user_story (id) NOT NULL
  --  status TEXT,
  --  url
);
