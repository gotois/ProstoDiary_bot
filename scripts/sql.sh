#!/bin/bash

psql --version;

# create database with extensions
psql -U $PGUSER -d postgres -a -f SQL/database.sql;

# public tables
psql -U $PGUSER -d $PGDATABASE -a -f SQL/session/tables/sessions.sql;

# client
psql -U $PGUSER -d $PGDATABASE -a -f SQL/passports/schemas/passport.sql;
# client tables
psql -U $PGUSER -d $PGDATABASE -a -f SQL/passports/tables/user.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/passports/tables/bot.sql;
# client views
psql -U $PGUSER -d $PGDATABASE -a -f SQL/passports/views/roles.sql;

# story
psql -U $PGUSER -d $PGDATABASE -a -f SQL/stories/schemas/story.sql;
# story types
psql -U $PGUSER -d $PGDATABASE -a -f SQL/stories/types/abstract_type.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/stories/types/tag.sql;
# story tables
psql -U $PGUSER -d $PGDATABASE -a -f SQL/stories/tables/message.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/stories/tables/content.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/stories/tables/abstract.sql;
# story views
psql -U $PGUSER -d $PGDATABASE -a -f SQL/stories/views/history.sql;

# assistant
psql -U $PGUSER -d $PGDATABASE -a -f SQL/assistants/schemas/assistant.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/assistants/tables/marketplace.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/assistants/tables/chat.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/assistants/tables/bot.sql;
