#!/bin/bash

psql --version;

# create database with extensions
psql -U postgres -d postgres -a -f database.sql;

# passport
psql -U postgres -d postgres -a -f passport/tables/passport.sql;
psql -U postgres -d postgres -a -f passport/tables/ld.sql;
psql -U postgres -d postgres -a -f passport/tables/bot.sql;

# message
psql -U postgres -d postgres -a -f messages/tables/message.sql;
psql -U postgres -d postgres -a -f messages/tables/abstract.sql;
