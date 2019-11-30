#!/bin/bash

psql --version;

psql -c 'create database $PGDATABASE ;' -U $PGUSER

# create database with extensions
psql -U $PGUSER -d $PGDATABASE -a -f database.sql;

# passport
psql -U $PGUSER -d $PGDATABASE -a -f ./passport/tables/passport.sql;
psql -U $PGUSER -d $PGDATABASE -a -f ./passport/tables/ld.sql;
psql -U $PGUSER -d $PGDATABASE -a -f ./passport/tables/bot.sql;

# message
psql -U $PGUSER -d $PGDATABASE -a -f ./messages/tables/message.sql;
psql -U $PGUSER -d $PGDATABASE -a -f ./messages/tables/abstract.sql;
