-- схема где храним соли, пароли и pgp ключи
--CREATE SCHEMA IF NOT EXISTS private AUTHORIZATION bot;

CREATE TABLE IF NOT EXISTS keys (
  created_at TIMESTAMP DEFAULT current_timestamp,
  updated_at TIMESTAMP DEFAULT current_timestamp,

--  salt TEXT NOT NULL,
  pgp_password TEXT NOT NULL, -- fixme
  secret_base32 TEXT NOT NULL, -- fixme 2 факторная аутентификация
  recover_keys TEXT ARRAY, -- fixme ключи рекавери, если пользователь потерял 2-факторную аутентификацию

  user_id TEXT REFERENCES jsonld (id)
);
-- todo нужна VIEW которая будет отдавать pgp_password
