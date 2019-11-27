CREATE TABLE IF NOT EXISTS passport (
-- специально используем gen_random_uuid, чтобы отслеживать по MAC адресу компьютер на котором было создание портрета пользователя
id UUID NOT NULL DEFAULT gen_random_uuid(),
telegram_id TEXT,
telegram_session JSONB,
facebook_id TEXT,
facebook_session JSONB,
yandex_id TEXT,
yandex_session JSONB,
UNIQUE (telegram_id, facebook_id, yandex_id),
PRIMARY KEY (id)
);
