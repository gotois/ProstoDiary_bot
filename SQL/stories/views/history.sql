CREATE MATERIALIZED VIEW public.story AS
SELECT
  story.message.id,
  story.message.version,
  story.message.updated_at,
  story.message.revision,
  passport.user.email AS creator_email,
  passport.bot.email AS publisher_email,
  story.content.content,
  story.content.content_type
FROM story.message
INNER JOIN passport.user ON passport.user.id = story.message.creator
INNER JOIN passport.bot ON passport.bot.id = story.message.publisher
INNER JOIN story.content ON story.content.message_id = story.message.id

-- TODO: для селекта роли bot делаем ограничения на доступ к определенным полям

-- todo нужен timestamp (SmartDate from - until) высчитываемый для истории. Возможно будет хорошей идеей генерировать уникальный view на каждый день
--CREATE MATERIALIZED VIEW IF NOT EXISTS history_eat AS
--SELECT *
--FROM abstract
--WHERE tags @> '{"eat"}';

--CREATE MATERIALIZED VIEW IF NOT EXISTS history_script AS
--SELECT *
--FROM abstract
--WHERE tags @> '{"script"}';
-- ... todo аналогично строить для каждого TAG
