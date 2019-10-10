--
-- Create DB
--
-- FIXME: создать роль бота
-- CREATE ROLE bot LOGIN;

-- Warning! Set UTF-8 encoding: https://gist.github.com/ffmike/877447
create DATABASE "ProstoDiaryDB"
    with
    OWNER = postgres
    ENCODING = 'UTF8'
--    LC_COLLATE = 'en_US.utf8'
--    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE "ProstoDiaryDB"
    IS 'Local DB';

--
-- Foods
--

-- Все на 100 гр. продукта
create UNLOGGED TABLE IF NOT EXISTS foods (
  id SERIAL PRIMARY KEY,
  title TEXT UNIQUE, -- нужен индекс по этому
  protein NUMERIC (5, 2) default NULL,
  fat NUMERIC (5, 2) default NULL,
  carbohydrate NUMERIC (5, 2) default NULL,
  kcal NUMERIC (5) default NULL
);

-- Хранимая процедура поиска по title мультиязычно
create or replace function to_tsvector_multilang (title TEXT) RETURNS tsvector as $$
SELECT to_tsvector('russian', $1) ||
       to_tsvector('english', $1) ||
       to_tsvector('simple', $1)
$$ LANGUAGE SQL IMMUTABLE;

-- Полнотекстовый поиск по тайтлу
create INDEX idx_gin_foods ON foods USING GIN (to_tsvector_multilang(title));

-- История пользователя будет представлена как "процесс"
create type TAG as ENUM (
  'undefined',
  'script',
  'buy',
  'eat',
  'finance',
  'fitness',
  'health',
  'meet',
  'pain',
  'todo',
  'weight',
  'height', -- Смена роста
  'family', -- Изменения в Семья
  -- todo Смена группа крови
  'work', -- смена вид деятельности
  'job', -- Здесь же смена уровня дохода | новая цели в карьере
  'birthday',-- Указание День рождения
  'hobby',
  'relationship', -- Изменения в отношениях
  'social',-- Новое сообщество
  'mood',-- настроение
  'gender'-- гендер и любое его изменение
  -- прочая биометрика
  -- Твореческое выражение
  -- данные об объемах покупок ценах
  -- информа­цию о состоянии текущих контрактов
);

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create type ABSTRACT_TYPE as ENUM (
  'soft',
  'hard',
  'core'
);

-- TODO: переделать схему под приватную и доступную для редактирования только роли бот
--create schema private;
CREATE TABLE IF NOT EXISTS abstract (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- глобальная историческая ссылка. в идеале - blockchain ID
  type ABSTRACT_TYPE NOT NULL,
  tags TAG ARRAY NOT NULL,
  mime VARCHAR(20) NOT NULL,
  --  raw -- todo raw source text, video, photo, document, etc
  --  raw_url
  version VARCHAR(20) NOT NULL CHECK (version <> ''), -- bot Version. отсюда же можно узнать и api version аналогична в package.json -нужна для проверки необходимости обновить историю бота
  jurisdiction JSONB, -- Intended jurisdiction for operation definition (if applicable); todo: нужна отдельная таблица для этого

--  timestamp

  creator JSONB NOT NULL, -- JSON-LD; todo: нужна отдельная приватная таблица для этого
  publisher VARCHAR(100) NOT NULL, -- название организации которые курируют разработку бота. todo: нужна отдельная таблица для этого

  telegram_user_id INTEGER default NULL,
  telegram_message_id INTEGER UNIQUE,
  user_email_id TEXT UNIQUE default NULL,
  context JSONB NOT NULL, -- TEXT чтобы дешифровать данные нужно выполнить дешифровку этой подписи telegram_id + SALT_PASSWORD


  --  status TEXT, -- это статус транзакции (нужен в дальнейшем) // draft | active | retired | unknown
  -- "kind": "operation", // operation | query
  --"experimental" : true, // For testing purposes, not real usage

  created_at timestamp default current_timestamp,
  updated_at timestamp default NULL

--  sign SOMEHASH PRIMARY KEY UNIQUE, -- электронная подпись сгенерированная ботом, которая подтверждает что бот не был скомпроментирован. todo: попробвать через `MD5('string');`?
  -- url: "https://gotointeractive.com/storylang/OperationDefinition/example", // Canonical identifier for this operation definition, represented as a URI (globally unique)
  -- "affectsState" : <boolean>, // Whether content is changed by the operation
  -- "code": "populate", //  Name used to invoke the operation
  -- "resource": [ // Types this operation applies to
  --   "Questionnaire"
  -- ],
);
CREATE UNIQUE INDEX ON abstract (tags);
-- todo Example
-- INSERT INTO public.abstract(
--	type, tags, mime, version, creator, publisher, context)
--	VALUES ('soft', '{"eat"}', 'text/sql', '0.0.0', '{"foo": 12}', 'test', '{"foo": 12}'::jsonb  );


-- todo create table author
--  id BIGSERIAL PRIMARY KEY,
--  bot_story_id BIGSERIAL REFERENCES bot_story ON UPDATE CASCADE ON DELETE CASCADE,


-- todo аналогично строить для каждого TAG
CREATE MATERIALIZED VIEW IF NOT EXISTS history_eat AS
SELECT *
FROM abstract
WHERE tags @> '{"eat"}';

CREATE UNIQUE INDEX ON history_eat (mime);
