CREATE TABLE IF NOT EXISTS assistant.chat
(
  assistant_bot_id UUID REFERENCES assistant.bot (id),
  id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,

  PRIMARY KEY (id)
);
