-- rename: user.passport
CREATE TABLE IF NOT EXISTS passport.user (
-- специально используем gen_random_uuid, чтобы отслеживать по MAC адресу компьютер на котором было создание портрета пользователя
id UUID NOT NULL DEFAULT gen_random_uuid(),
-- primary email который используется при первой регистрации. основной ящик можно затем изменить
email TEXT UNIQUE,

-- привязки OAuth
telegram_id TEXT UNIQUE,
telegram_passport JSONB,
facebook_id TEXT UNIQUE,
facebook_passport JSONB,
facebook_session JSONB,
yandex_id TEXT UNIQUE,
yandex_passport JSONB,
yandex_session JSONB,

PRIMARY KEY (id)
);

GRANT ALL ON TABLE passport.user TO bot;
