CREATE
    TABLE
        IF NOT EXISTS client.bot (
            id UUID NOT NULL DEFAULT gen_random_uuid (
            )
            ,passport_id UUID REFERENCES client.passport (id)
                ON UPDATE
                    CASCADE
                        ON DELETE
                            CASCADE
            ,updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            ,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ,activated BOOLEAN NOT NULL DEFAULT FALSE -- активирован или деактиван бот
            ,email TEXT NOT NULL UNIQUE -- почта бота в домене gotointeractive.com
            ,email_uid TEXT NOT NULL
            ,email_password TEXT NOT NULL -- не захэшированный пароль для почты (и для авторизации API)
            ,master_password TEXT NOT NULL -- захэшированный пароль, дающий пользователю право управлять ботом, а также использующийся вместо двухфакторной аутентификации
 			,secret_key TEXT NOT NULL -- секретный ключ, необходимый для привязки двухфакторной аутентификации и для расшифровки PGP сообщений -- todo возможно deprecated, нужно использовать public_key_cert
 			,public_key_cert BYTEA NOT NULL
            ,private_key_cert BYTEA NOT NULL
            ,PRIMARY KEY (id)
        )
; GRANT ALL
    ON TABLE
    client.bot TO bot
;
