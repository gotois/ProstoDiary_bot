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
  'undefined',
  'install',
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

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TODO: переделать схему под приватную и доступную для редактирования только роли бот
--create schema private;
CREATE TABLE IF NOT EXISTS bot_story (
  id BIGSERIAL PRIMARY KEY,
--  todo: вместо id использовать sign - выполняет роль публичного ключа.Затем чтобы дешифровать данные нужно выполнить дешифровку этой подписи telegram_id + SALT_PASSWORD
--  sign SOMEHASH PRIMARY KEY, -- подпись сгенерированная ботом, которая подтверждает что бот не был скомпроментирован. todo: попробвать через `MD5('string');`?
  version VARCHAR(20) NOT NULL, -- аналогична в package.json -нужна для проверки необходимости обновить историю бота
  author JSONB NOT NULL, -- JSON-LD; todo: нужна отдельная приватная таблица для этого
  publisher VARCHAR(100) NOT NULL, -- todo: нужна отдельная таблица для этого
  jurisdiction JSONB, -- todo: нужна отдельная таблица для этого
  telegram_user_id INTEGER NOT NULL
);
--
-- TODO: переделать схему под приватную и доступную для ...?
--
CREATE TABLE IF NOT EXISTS user_story (
  id BIGSERIAL PRIMARY KEY,
  type INTENT NOT NULL,
  telegram_message_id INTEGER NOT NULL UNIQUE,
  context JSONB NOT NULL
);
-- FIXME: нужен индекс для типа
--CREATE INDEX idx_intent ON user_story USING GIN (type);
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- глобальная историческая ссылка
  bot_story_id BIGSERIAL REFERENCES bot_story ON UPDATE CASCADE ON DELETE CASCADE,
  user_story_id BIGSERIAL REFERENCES user_story  ON UPDATE CASCADE ON DELETE CASCADE,
  created_at timestamp default current_timestamp, -- Первая сформированной очереди
  updated_at timestamp default NULL -- Последняя дата апдейта очереди
  --  status TEXT, -- это статус транзакции (нужен в дальнейшем) // draft | active | retired | unknown
);
