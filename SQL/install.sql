-- Warning! Set UTF-8 encoding: https://gist.github.com/ffmike/877447
CREATE DATABASE ProstoDiaryDB
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
--    LC_COLLATE = 'en_US.utf8'
--    LC_CTYPE = 'en_US.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE ProstoDiaryDB IS 'Local DB';

CREATE USER bot WITH ENCRYPTED PASSWORD '0000';
GRANT ALL PRIVILEGES ON DATABASE ProstoDiaryDB TO bot;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- todo перенести это в стороннего ассистента https://github.com/gotois/nutrition_bot
-- Все на 100 гр. продукта
CREATE UNLOGGED TABLE IF NOT EXISTS foods (
  id SERIAL PRIMARY KEY,
  title TEXT UNIQUE, -- нужен индекс по этому
  protein NUMERIC (5, 2) default NULL,
  fat NUMERIC (5, 2) default NULL,
  carbohydrate NUMERIC (5, 2) default NULL,
  kcal NUMERIC (5) default NULL
);

-- Хранимая процедура поиска по title мультиязычно
CREATE OR REPLACE FUNCTION to_tsvector_multilang (title TEXT) RETURNS tsvector as $$
SELECT to_tsvector('russian', $1) ||
       to_tsvector('english', $1) ||
       to_tsvector('simple', $1)
$$ LANGUAGE SQL IMMUTABLE;

-- Полнотекстовый поиск по тайтлу
CREATE INDEX idx_gin_foods ON foods USING GIN (to_tsvector_multilang(title));

CREATE TYPE TAG AS ENUM (
  'undefined',
  'script',
  'buy',
  'kpp',
  'weather',
  'sex',
  'contract', -- информа­цию о состоянии текущих контрактов
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
  'work', -- смена вид деятельности
  'job', -- Здесь же смена уровня дохода | новая цели в карьере
  'birthday',-- Указание День рождения
  'hobby',
  'relationship', -- Изменения в отношениях
  'social',-- Новое сообщество
  'mood',-- настроение и твореческое выражение
  'gender'-- гендер и любое его изменение
  -- todo прочие изменения биометрики
);

CREATE TYPE ABSTRACT_TYPE AS ENUM (
  'untrusted', -- Запись требует обработки
  'soft', -- Запись только кажется верной
  'hard', -- Запись может быть правдивой
  'core' -- Исключительно точный ввод
);

CREATE TABLE IF NOT EXISTS message (
  id SERIAL PRIMARY KEY AUTOINC,
  -- todo добавить uid письма
  url TEXT CONSTRAINT must_be_different UNIQUE, -- ссылка на email attachment
  telegram_message_id SERIAL must_be_different UNIQUE, -- сообщение телеграмма
  UNIQUE(telegram_message_id)
);
-- todo нужна VIEW которая будет отдавать bytea сырых данных - raw таблицы

CREATE TABLE IF NOT EXISTS jsonld (
  @id TEXT NOT NULL,
  @context TEXT NOT NULL,
  email TEXT NOT NULL,
  telegram SERIAL,
  sameAs TEXT ARRAY,
  UNIQUE(email, telegram, sameAs),
  PRIMARY KEY (@id)
);
CREATE UNIQUE INDEX ON jsonld (@id);
CREATE UNIQUE INDEX ON jsonld (email);
CREATE UNIQUE INDEX ON jsonld (telegram);
-- todo нужна VIEW которая будет отдавать полный стандарт JSON-LD https://github.com/gotois/ProstoDiary_bot/issues/236

CREATE TABLE IF NOT EXISTS abstract (
  id UUID DEFAULT uuid_generate_v4(), -- глобальная историческая ссылка. в идеале - blockchain ID
  updated_at TIMESTAMP DEFAULT current_timestamp, -- время необходимое для того чтобы знать что оно было изменено
  created_at TIMESTAMP NOT NULL, -- время записи публикации (может меняться если вычислено более правильное время)
  type ABSTRACT_TYPE NOT NULL,
  tags TAG ARRAY NOT NULL,
  mime VARCHAR(20) NOT NULL CHECK (mime <> ''),
  version VARCHAR(20) NOT NULL CHECK (version <> ''), -- bot Version. отсюда же можно узнать и api version аналогична в package.json -нужна для проверки необходимости обновить историю бота
  context JSONB NOT NULL, -- todo CRYPTO: чтобы дешифровать данные нужно выполнить дешифровку этой подписи telegram_id + SALT_PASSWORD

  -- todo need help
  -- jurisdiction JSONB, -- Intended jurisdiction for operation definition (if applicable); todo: нужна отдельная таблица
  -- sign SOMEHASH -- todo электронная подпись сгенерированная ботом, которая подтверждает что бот не был скомпроментирован. todo: попробвать через `MD5('string');`?
  -- url: "https://gotointeractive.com/storylang/OperationDefinition/example", -- todo Canonical identifier for this operation definition, represented as a URI (globally unique)
  -- status TEXT, -- это статус транзакции (нужен в дальнейшем) // draft | active | retired | unknown . draft когда еще не было никуда записано, затем статус когда записано на почту, но не обработано
  -- kind TEXT, -- operation | query
  -- experimental: BOOLEAN -- For testing purposes, not real usage
  -- "affectsState" : <boolean>, // Whether content is changed by the operation
  -- "code": "populate", //  Name used to invoke the operation
  -- "resource": [ // Types this operation applies to
  --   "Questionnaire"
  -- ],

  PRIMARY KEY (id),
  FOREIGN KEY (message_id) REFERENCES message (id) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (creator_id) REFERENCES jsonld (id) ON UPDATE CASCADE ON DELETE CASCADE, -- ответственный за создание записи
  FOREIGN KEY (publisher_id) REFERENCES jsonld (id) ON UPDATE CASCADE ON DELETE CASCADE, -- ответственный за публикацию записи, либо сам ProstoDiary_bot, либо внешний сторонний сервис, включая других ботов
  UNIQUE(created_at)
);
CREATE UNIQUE INDEX ON abstract (tags);
CREATE UNIQUE INDEX ON abstract (creator_id);
CREATE UNIQUE INDEX ON abstract (publisher_id);

-- История пользователя представлена как "процесс"
-- TODO: переделать схему под приватную и доступную для редактирования только роли бот
-- todo нужен timestamp (SmartDate from - until) высчитываемый для истории. Возможно будет хорошей идеей генерировать уникальный view на каждый день
CREATE MATERIALIZED VIEW IF NOT EXISTS history_eat AS
SELECT *
FROM abstract
WHERE tags @> '{"eat"}';

CREATE MATERIALIZED VIEW IF NOT EXISTS history_script AS
SELECT *
FROM abstract
WHERE tags @> '{"script"}';

-- todo аналогично строить для каждого TAG
