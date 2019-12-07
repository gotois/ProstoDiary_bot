-- схема где храним соли, пароли и pgp ключи
--CREATE SCHEMA IF NOT EXISTS private AUTHORIZATION bot;

CREATE TABLE IF NOT EXISTS public.story (
id UUID DEFAULT uuid_generate_v4(), -- глобальная историческая ссылка. в идеале - blockchain ID
-- contentType TEXT,
-- raw BINARY, -- здесь находится первоначальный текст/фото/видео сообщения - todo ожидается что raw не будет, что достать данные можно будет через письмо определенное время
-- sign SOMEHASH -- todo электронная подпись сгенерированная ботом, которая подтверждает что бот не был скомпроментирован. todo: попробвать через `MD5('string');`?

uid INT, -- UID письма может повторяться, предусмотреть это
smtp_id TEXT UNIQUE, -- ссылка на email или messageId в почте
telegram_message_id BIGINT CONSTRAINT must_be_different UNIQUE, -- id сообщение телеграмма

-- тип записи, от неточного к точному
-- 1 - сначала письмо отправленное пользователем.
-- 2 - письмо из которого были сформированы JSON-LD документы
-- 3 - отвалидированные JSON-LD документы подтвержденные другими людьми
type ABSTRACT_TYPE NOT NULL,

-- todo это массив
ld_id BIGSERIAL REFERENCES data.ld (id) ON UPDATE CASCADE, -- структурированные данные в виде JSON-LD


mime VARCHAR(20) NOT NULL CHECK (mime <> ''), -- mime тип сообщения
version VARCHAR(20) NOT NULL CHECK (version <> ''), -- bot Version. отсюда же можно узнать и api version. Аналогичен version в package.json на момент записи - нужен для проверки необходимости обновить историю бота или изменению формата хранения

-- использовать from, to как в email?
creator_id UUID REFERENCES passport.user (id) ON UPDATE CASCADE ON DELETE CASCADE, -- ответственный за создание записи
publisher_id UUID REFERENCES passport.user (id) ON UPDATE CASCADE ON DELETE CASCADE, -- ответственный за публикацию записи, сам gotois, либо внешний сторонний сервис, включая других ботов

tags TAG ARRAY NOT NULL, -- ярлыки, указывающие что именно может находиться в сообщении todo переименовать на labels?

-- todo использовать свой date [from, until]?
updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp, -- время необходимое для того чтобы знать что оно было изменено
created_at TIMESTAMP DEFAULT current_timestamp, -- время записи публикации (может меняться если вычислено более правильное время)

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

UNIQUE(telegram_message_id, ld_id),
PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ON public.message (tags);
CREATE UNIQUE INDEX ON public.message (creator_id);
CREATE UNIQUE INDEX ON public.message (publisher_id);

GRANT ALL PRIVILEGES ON public.message TO bot;
