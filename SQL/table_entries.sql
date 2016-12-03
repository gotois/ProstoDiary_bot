create table entries (
  id bigserial primary key,
  user_id integer REFERENCES users (telegram_user_id),
  entry TEXT,
  telegram_entry_id integer NOT NULL unique,
  date_added timestamp default current_timestamp,
  date_modified timestamp default NULL
);