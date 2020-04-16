CREATE
    TABLE
        IF NOT EXISTS assistant.bot (
            id UUID NOT NULL DEFAULT gen_random_uuid (
            )
            ,assistant_marketplace_id UUID
            ,token TEXT NOT NULL -- jwt id_token
            ,private_key TEXT NOT NULL -- base58 key
            ,public_key TEXT NOT NULL -- base58 key
            ,bot_user_email TEXT NOT NULL UNIQUE -- почта бота пользователя
            ,FOREIGN KEY (assistant_marketplace_id) REFERENCES marketplace.client (id)  ON UPDATE CASCADE ON DELETE CASCADE
            ,PRIMARY KEY (id)
        )
;
