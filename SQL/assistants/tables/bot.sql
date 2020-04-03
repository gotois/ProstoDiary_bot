-- такой ассистент знает только почту бота и все
CREATE TABLE IF NOT EXISTS assistant.bot
(
  id UUID NOT NULL DEFAULT gen_random_uuid(),

  assistant_marketplace_id UUID REFERENCES assistant.marketplace (id),
  token TEXT NOT NULL, -- jwt id_token
  bot_user_email TEXT NOT NULL UNIQUE, -- почта бота пользователя

  PRIMARY KEY (id)
);
