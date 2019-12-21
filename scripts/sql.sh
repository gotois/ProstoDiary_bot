#!/bin/bash

psql --version;

# create database with extensions
psql -U $PGUSER -d postgres -a -f SQL/database.sql;

# session
psql -U $PGUSER -d $PGDATABASE -a -f SQL/session/tables/sessions.sql;

# linked data
psql -U $PGUSER -d $PGDATABASE -a -f SQL/linked-data/tables/ld.sql;

# passport
psql -U $PGUSER -d $PGDATABASE -a -f SQL/passports/schemas/passport.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/passports/tables/user.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/passports/tables/bot.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/passports/views/roles.sql;

# message
psql -U $PGUSER -d $PGDATABASE -a -f SQL/stories/schemas/story.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/stories/types/abstract_type.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/stories/types/tag.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/stories/tables/message.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/stories/tables/content.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/stories/tables/abstract.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/stories/views/history.sql;

