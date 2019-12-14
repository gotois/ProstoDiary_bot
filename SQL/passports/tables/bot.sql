CREATE TABLE IF NOT EXISTS passport.bot (
id UUID NOT NULL DEFAULT gen_random_uuid(),

-- todo нужно добавить токены для ассистентов

passport_id UUID REFERENCES passport.user (id) ON UPDATE CASCADE ON DELETE CASCADE,
updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
created_at TIMESTAMP DEFAULT current_timestamp,
-- активирован или деактиван бот
activated BOOLEAN NOT NULL DEFAULT false,
-- не захэшированная почта в домене gotointeractive.com
email TEXT NOT NULL UNIQUE,
email_uid TEXT NOT NULL,
-- не захэшированный пароль для почты (и для авторизации API)
password TEXT NOT NULL,
-- секретный ключ, необходимый для привязки двухфакторной аутентификации и для расшифровки PGP сообщений (FIXME что неверно, требуется генерировать .cert)
-- fixme такой же ключ используется ассистентами для верификации полученных писем
secret_key TEXT NOT NULL,
-- захэшированный пароль, дающий пользователю право управлять ботом, а также использующийся вместо двухфакторной аутентификации
master_password TEXT NOT NULL,

PRIMARY KEY (id)
);

GRANT ALL ON TABLE passport.bot TO bot;
