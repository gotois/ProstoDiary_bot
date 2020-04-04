CREATE
    TABLE
        IF NOT EXISTS assistant.bot (
            id UUID NOT NULL DEFAULT gen_random_uuid (
            )
            ,assistant_marketplace_id UUID
            ,token TEXT NOT NULL -- jwt id_token
            ,bot_user_email TEXT NOT NULL UNIQUE -- почта бота пользователя
            ,FOREIGN KEY (assistant_marketplace_id) REFERENCES assistant.marketplace (id)  ON UPDATE CASCADE ON DELETE CASCADE
            ,PRIMARY KEY (id)
        )
;
