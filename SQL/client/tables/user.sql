CREATE
    TABLE
        IF NOT EXISTS client.passport (
			id UUID NOT NULL DEFAULT gen_random_uuid (
            ) -- специально используем gen_random_uuid, чтобы отслеживать по MAC адресу компьютер на котором было создание портрета пользователя
            ,email TEXT UNIQUE -- primary email который используется при первой регистрации. Основной ящик можно затем изменить
            -- todo добавить поле email_verified
            ,phone TEXT UNIQUE -- primary phone используется при первой регистрации. Телефон после нельзя изменить
            ,telegram_id TEXT UNIQUE -- привязки OAuth
            ,telegram_passport JSONB
            ,facebook_id TEXT UNIQUE
            ,facebook_passport JSONB
            ,facebook_session JSONB
            ,yandex_id TEXT UNIQUE
            ,yandex_passport JSONB
            ,yandex_session JSONB
            ,PRIMARY KEY (id)
        )
;
-- skip to heroku
GRANT ALL
    ON TABLE
    client.passport TO bot
;
