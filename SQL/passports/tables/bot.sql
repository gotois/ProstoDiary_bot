CREATE TABLE IF NOT EXISTS passport.bot (
passport_id UUID REFERENCES passport.user (id) ON UPDATE CASCADE ON DELETE CASCADE,
updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
created_at TIMESTAMP DEFAULT current_timestamp,
-- активирован или деактиван бот
activated BOOLEAN NOT NULL DEFAULT false,
-- не захэшированная почта в домене gotointeractive.com
email TEXT NOT NULL,
email_uid TEXT NOT NULL,
-- не захэшированный мастер пароль, используется ботом для почты и для auth
password TEXT NOT NULL,
-- секретный ключ, необходимый для привязки двухфакторной аутентификации
secret_key TEXT NOT NULL,
-- захэшированный пароль, дающий пользователю право на большее, чем бот, а также использующийся вместо двухфакторной аутентификации
secret_password TEXT NOT NULL,
-- todo боту нужен свой linked-data?
UNIQUE (email)
);

GRANT ALL ON TABLE passport.bot TO bot;
