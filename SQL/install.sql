--
-- Create DB
--

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
CREATE TABLE IF NOT EXISTS Foods (
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
CREATE INDEX idx_gin_foods ON Foods
  USING GIN (to_tsvector_multilang(title));


--
-- Users
--

-- TODO: переделать схему под приватную
--create schema private;
CREATE TABLE IF NOT EXISTS Users (
  telegram_user_id integer PRIMARY KEY UNIQUE,
  date_added timestamp default current_timestamp
);


--
-- записи
--
CREATE TABLE IF NOT EXISTS Entries (
  id bigserial PRIMARY KEY,
  user_id integer REFERENCES Users (telegram_user_id),
  entry TEXT, -- каждый текст должен быть уникальным. если такой текст уже пользователь писал, то будет ссылка на него. таким образом можно достичь подсчета одинаковых действий
  telegram_entry_id integer NOT NULL UNIQUE,
  date_added timestamp default current_timestamp,
  date_modified timestamp default NULL
);
