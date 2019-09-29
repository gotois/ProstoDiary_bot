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
create or replace function to_tsvector_multilang (title Text) RETURNS tsvector as $$
SELECT to_tsvector('russian', $1) ||
       to_tsvector('english', $1) ||
       to_tsvector('simple', $1)
$$ LANGUAGE sql IMMUTABLE;

-- Полнотекстовый поиск по тайтлу
create INDEX idx_gin_foods ON Foods USING GIN (to_tsvector_multilang(title));

-- История пользователя будет представлена как "процесс"
create type intent as ENUM (
  'undefined',
  'system', -- указывает на произошедшее в самом боте
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

-- TODO: переделать схему под приватную и доступную для редактирования только роли бот
--create schema private;
CREATE TABLE IF NOT EXISTS bot_story (
  id BIGSERIAL PRIMARY KEY,
--  sign SOMEHASH PRIMARY KEY UNIQUE, -- электронная подпись сгенерированная ботом, которая подтверждает что бот не был скомпроментирован. todo: попробвать через `MD5('string');`?
  version VARCHAR(20) NOT NULL CHECK (version <> ''), -- bot Version. отсюда же можно узнать и api version аналогична в package.json -нужна для проверки необходимости обновить историю бота
  author JSONB NOT NULL, -- JSON-LD; todo: нужна отдельная приватная таблица для этого; также более правильнее если это будет перенесено в user_story
  publisher VARCHAR(100) NOT NULL, -- название организации которые курируют разработку бота. todo: нужна отдельная таблица для этого
  jurisdiction JSONB, -- Intended jurisdiction for operation definition (if applicable); todo: нужна отдельная таблица для этого
  telegram_user_id INTEGER NOT NULL
);
--
-- TODO: переделать схему под приватную и доступную для ...?
--
CREATE TABLE IF NOT EXISTS user_story (
  id BIGSERIAL PRIMARY KEY,
  type INTENT NOT NULL,
  telegram_message_id INTEGER NOT NULL UNIQUE, -- todo: думаю это тоже нужно перенести в bot_story table
  context JSONB NOT NULL -- TEXT чтобы дешифровать данные нужно выполнить дешифровку этой подписи telegram_id + SALT_PASSWORD
);
CREATE INDEX IF NOT EXISTS idx_intent ON user_story (type);

CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- глобальная историческая ссылка. в идеале - blockchain ID
  -- todo raw source text, video, photo, document, etc
  -- ...
  bot_story_id BIGSERIAL REFERENCES bot_story ON UPDATE CASCADE ON DELETE CASCADE,
  user_story_id BIGSERIAL REFERENCES user_story  ON UPDATE CASCADE ON DELETE CASCADE,
  created_at timestamp default current_timestamp, -- Первая сформированной очереди
  updated_at timestamp default NULL -- Последняя дата апдейта очереди
  --  status TEXT, -- это статус транзакции (нужен в дальнейшем) // draft | active | retired | unknown
  -- url: "https://gotointeractive.com/storylang/OperationDefinition/example", // Canonical identifier for this operation definition, represented as a URI (globally unique)

  -- ниже под вопросом
  --  "name": "Populate Questionnaire", // Name for this operation definition (computer friendly)
  --"experimental" : true, // For testing purposes, not real usage
  -- "kind": "operation", // operation | query
  -- "affectsState" : <boolean>, // Whether content is changed by the operation
  -- "code": "populate", //  Name used to invoke the operation
  -- "resource": [ // Types this operation applies to
  --   "Questionnaire"
  -- ],
);
