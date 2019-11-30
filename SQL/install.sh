#!/bin/bash

psql --version;

# create database with extensions
psql -U $PGUSER -d postgres -a -f SQL/database.sql;

# passport
psql -U $PGUSER -d $PGDATABASE -a -f SQL/passport/tables/passport.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/passport/tables/ld.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/passport/tables/bot.sql;

# message
psql -U $PGUSER -d $PGDATABASE -a -f SQL/messages/tables/message.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/messages/tables/abstract.sql;
