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
  id BIGSERIAL,
  -- todo добавить uid письма
  url TEXT UNIQUE, -- ссылка на email attachment
  telegram_message_id SERIAL CONSTRAINT must_be_different UNIQUE, -- сообщение телеграмма
  UNIQUE(telegram_message_id),
  PRIMARY KEY (id)
);
-- todo нужна VIEW которая будет отдавать bytea сырых данных - raw таблицы

CREATE TABLE IF NOT EXISTS jsonld (
  id TEXT NOT NULL,
  context TEXT NOT NULL,
  email TEXT NOT NULL,
  telegram SERIAL,
  sameAs TEXT ARRAY,
  UNIQUE(email, telegram, sameAs),
  PRIMARY KEY (id)
);
CREATE UNIQUE INDEX ON jsonld (id);
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
  context JSONB NOT NULL, -- todo использовать криптование

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

  message_id BIGSERIAL REFERENCES message (id) ON UPDATE CASCADE ON DELETE CASCADE,
  creator_id TEXT REFERENCES jsonld (id) ON UPDATE CASCADE ON DELETE CASCADE, -- ответственный за создание записи
  publisher_id TEXT REFERENCES jsonld (id) ON UPDATE CASCADE ON DELETE CASCADE, -- ответственный за публикацию записи, либо сам ProstoDiary_bot, либо внешний сторонний сервис, включая других ботов

  PRIMARY KEY (id),
  UNIQUE(created_at)
);
CREATE UNIQUE INDEX ON abstract (tags);
CREATE UNIQUE INDEX ON abstract (creator_id);
CREATE UNIQUE INDEX ON abstract (publisher_id);
