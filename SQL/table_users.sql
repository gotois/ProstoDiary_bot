-- TODO: переделать схему под приватную
--create schema private;

create table users (
  telegram_user_id integer primary key unique,
  date_added timestamp default current_timestamp
);
