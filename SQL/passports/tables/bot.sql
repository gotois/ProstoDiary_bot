CREATE TABLE IF NOT EXISTS passport.bot (
id UUID NOT NULL DEFAULT gen_random_uuid(),

passport_id UUID REFERENCES passport.user (id) ON UPDATE CASCADE ON DELETE CASCADE,
updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
created_at TIMESTAMP DEFAULT current_timestamp,
-- активирован или деактиван бот
activated BOOLEAN NOT NULL DEFAULT false,
-- не захэшированная почта в домене gotointeractive.com
email TEXT NOT NULL UNIQUE,
email_uid TEXT NOT NULL,
-- не захэшированный пароль для почты (и для авторизации API)
email_password TEXT NOT NULL,
-- захэшированный пароль, дающий пользователю право управлять ботом, а также использующийся вместо двухфакторной аутентификации
master_password TEXT NOT NULL,

-- секретный ключ, необходимый для привязки двухфакторной аутентификации и для расшифровки PGP сообщений
-- возможно deprecated, нужно использовать public_key_cert
secret_key TEXT NOT NULL,

public_key_cert BYTEA NOT NULL,
private_key_cert BYTEA NOT NULL,

-- собственно сам чат телеграма
telegram_chat_id TEXT,

-- todo нужно добавить id и controller вида:
-- думаю можно использовать отдельную VIEW для этого, где брать alice в виде bot id, а key инкрементировать через SERIAL
-- https://example.com/i/alice/keys/1 и https://example.com/i/alice

PRIMARY KEY (id)
);

GRANT ALL ON TABLE passport.bot TO bot;
