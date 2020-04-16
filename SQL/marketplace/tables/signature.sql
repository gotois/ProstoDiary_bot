CREATE
    TABLE
        IF NOT EXISTS marketplace.signature (
        	assistant_marketplace_id UUID
            ,fingerprint TEXT NOT NULL -- base58 string
            ,verification TEXT NOT NULL UNIQUE -- URL like https://gotointeractive.com/marketplace/:marketplace_id/keys/:assistant_id
            ,FOREIGN KEY (assistant_marketplace_id) REFERENCES marketplace.client (id) ON UPDATE CASCADE ON DELETE CASCADE
        )
;
