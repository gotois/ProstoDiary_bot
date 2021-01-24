#!/bin/bash

psql --version;

# create database with extensions
psql -U $PGUSER -d postgres -a -f SQL/database.sql;

# session tables
psql -U $PGUSER -d $PGDATABASE -a -f SQL/session/tables/sessions.sql;

# client
psql -U $PGUSER -d $PGDATABASE -a -f SQL/client/schemas/schema.sql;
# client tables
psql -U $PGUSER -d $PGDATABASE -a -f SQL/client/tables/passport.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/client/tables/bot.sql;
# client views
psql -U $PGUSER -d $PGDATABASE -a -f SQL/client/views/roles.sql;

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

# marketplace
psql -U $PGUSER -d $PGDATABASE -a -f SQL/marketplace/schemas/schema.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/marketplace/tables/signature.sql;

# 3rd assistants
psql -U $PGUSER -d $PGDATABASE -a -f SQL/assistants/schemas/assistant.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/assistants/tables/bot.sql;
psql -U $PGUSER -d $PGDATABASE -a -f SQL/assistants/tables/chat.sql;
