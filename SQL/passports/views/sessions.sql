-- fixme сделать View
CREATE TABLE IF NOT EXISTS sessions (
telegram_id UUID REFERENCES passport (telegram),
bot_email_uid REFERENCES bot (email_uid),
bot_email TEXT REFERENCES bot (email)
-- todo данные о 2Auth авторизации, включающие время жизни токена
--yandex_token_expires
--facebook_token_expires
);
