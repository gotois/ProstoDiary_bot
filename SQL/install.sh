#!/bin/bash

psql --version;

# create database with extensions
psql -U $PGUSER -d postgres -a -f SQL/database.sql;

# linked data
psql -U $PGUSER -d $PGDATABASE -a -f SQL/lined-data/tables/ld.sql;

# passport
psql -U $PGUSER -d $PGDATABASE -a -f SQL/passport/tables/user.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/passport/tables/bot.sql;

# message
psql -U $PGUSER -d $PGDATABASE -a -f SQL/messages/types/abstract_type.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/messages/types/tag.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/messages/tables/message.sql;
