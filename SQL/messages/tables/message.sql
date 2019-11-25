CREATE TABLE IF NOT EXISTS message (
id BIGSERIAL,
uid TEXT, -- todo UID письма может повторяться, предусмотреть это
url TEXT UNIQUE, -- ссылка на email attachment
telegram_message_id BIGINT CONSTRAINT must_be_different UNIQUE, -- сообщение телеграмма
UNIQUE(telegram_message_id),
PRIMARY KEY (id)
);/Users/macbook/WebstormProjects/ProstoDiary_bot/src/api/v3/oauth.js
-- todo нужна VIEW которая будет отдавать bytea сырых данных - raw таблицы
