CREATE TABLE IF NOT EXISTS passport (
-- специально используем gen_random_uuid, чтобы отслеживать по MAC адресу компьютер на котором было создание портрета пользователя
id UUID NOT NULL DEFAULT gen_random_uuid(),
-- todo для регистрации надо включить паспорт
-- xxx
facebook_id BIGINT,
yandex_id BIGINT,
telegram BIGINT, -- todo как вариант - хэшировать
--user_email TEXT, -- todo добавить возможность авторизовываться через email и прочие способы (whatsapp, телефон)
UNIQUE (telegram, facebook_id, yandex_id),
PRIMARY KEY (id)
);
