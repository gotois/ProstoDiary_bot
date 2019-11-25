-- todo смержить abstract с message
CREATE TABLE IF NOT EXISTS abstract (
  id UUID DEFAULT uuid_generate_v4(), -- глобальная историческая ссылка. в идеале - blockchain ID
  updated_at TIMESTAMP NOT NULL DEFAULT now(), -- время необходимое для того чтобы знать что оно было изменено
  created_at TIMESTAMP DEFAULT current_timestamp, -- время записи публикации (может меняться если вычислено более правильное время)
  type ABSTRACT_TYPE NOT NULL,
  tags TAG ARRAY NOT NULL,
  mime VARCHAR(20) NOT NULL CHECK (mime <> ''),
  version VARCHAR(20) NOT NULL CHECK (version <> ''), -- bot Version. отсюда же можно узнать и api version аналогична в package.json -нужна для проверки необходимости обновить историю бота
  context JSONB NOT NULL, -- todo использовать криптование

  -- todo need help
  -- jurisdiction JSONB, -- Intended jurisdiction for operation definition (if applicable); todo: нужна отдельная таблица
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
  -- использовать from, to как в email?
  creator_id UUID REFERENCES passport (id) ON UPDATE CASCADE ON DELETE CASCADE, -- ответственный за создание записи
  publisher_id UUID REFERENCES passport (id) ON UPDATE CASCADE ON DELETE CASCADE, -- ответственный за публикацию записи, либо сам ProstoDiary_bot, либо внешний сторонний сервис, включая других ботов

  -- todo возможно из sign можно будет получать ответственного за публикацию
-- sign SOMEHASH -- todo электронная подпись сгенерированная ботом, которая подтверждает что бот не был скомпроментирован. todo: попробвать через `MD5('string');`?

PRIMARY KEY (id),
  UNIQUE(created_at)
);
CREATE UNIQUE INDEX ON abstract (tags);
CREATE UNIQUE INDEX ON abstract (creator_id);
CREATE UNIQUE INDEX ON abstract (publisher_id);
