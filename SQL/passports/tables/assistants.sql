CREATE TABLE assistant
(
  user_id TEXT NOT NULL UNIQUE, -- user login aka email or telegram user id
  token TEXT NOT NULL, -- jwt id_token
  created_at TIMESTAMP NOT NULL DEFAULT localtimestamp,
  updated_at TIMESTAMP NOT NULL DEFAULT localtimestamp
);
