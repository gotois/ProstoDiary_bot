CREATE TABLE IF NOT EXISTS message (
id BIGSERIAL,
uid TEXT, -- todo UID письма может повторяться, предусмотреть это или вести поле provider_email
url TEXT UNIQUE, -- ссылка на email attachment
telegram_message_id BIGINT CONSTRAINT must_be_different UNIQUE, -- сообщение телеграмма

-- sign SOMEHASH -- todo электронная подпись сгенерированная ботом, которая подтверждает что бот не был скомпроментирован. todo: попробвать через `MD5('string');`?

UNIQUE(telegram_message_id),
PRIMARY KEY (id)
);

GRANT ALL PRIVILEGES ON message TO bot;
