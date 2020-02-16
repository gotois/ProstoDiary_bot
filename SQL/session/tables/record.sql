-- oidc
CREATE TABLE record
(
  id text PRIMARY KEY,
  name text not null,
  data jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT localtimestamp,
  updated_at TIMESTAMP NOT NULL DEFAULT localtimestamp,
  expires_at TIMESTAMP
);
