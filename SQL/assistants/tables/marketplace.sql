-- Записи всех подключенных ассистентов к gotois marketplace (oidc provider)
CREATE TABLE IF NOT EXISTS assistant.marketplace
(
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP NOT NULL DEFAULT localtimestamp,
  updated_at TIMESTAMP NOT NULL DEFAULT localtimestamp,

  client_id TEXT NOT NULL UNIQUE, -- имя ассистента, например tg@gotointeractive.com
  client_secret TEXT NOT NULL,
  response_types TEXT[] NOT NULL,
  grant_types TEXT[] NOT NULL,
  redirect_uris TEXT[] NOT NULL,
  token_endpoint_auth_method TEXT NOT NULL DEFAULT 'client_secret_post',
  application_type TEXT NOT NULL DEFAULT 'web',

  homepage TEXT, -- ссылка вида tg://resolve?domain=ProstoDiary_bot

  PRIMARY KEY (id)
);
