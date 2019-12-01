CREATE SCHEMA passport;

CREATE TABLE IF NOT EXISTS passport.user (
-- специально используем gen_random_uuid, чтобы отслеживать по MAC адресу компьютер на котором было создание портрета пользователя
id UUID NOT NULL DEFAULT gen_random_uuid(),
ld_id BIGSERIAL REFERENCES data.ld (id) ON UPDATE CASCADE,
telegram_id TEXT,
telegram_passport JSONB,
facebook_id TEXT,
facebook_passport JSONB,
facebook_session JSONB,
yandex_id TEXT,
yandex_passport JSONB,
yandex_session JSONB,
UNIQUE (telegram_id, facebook_id, yandex_id),
PRIMARY KEY (id)
);

GRANT ALL ON TABLE passport.user TO bot;
