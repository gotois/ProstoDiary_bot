CREATE MATERIALIZED VIEW public.story AS
SELECT
  story.message.id,
  story.message.version,
  story.content.created_at::DATE,
  story.message.updated_at::DATE,
  story.message.revision,
--  client.passport.email AS creator_email, -- todo поддержать
  client.bot.email AS publisher_email,
  story.content.content,
  array_agg(story.abstract.category) AS categories,
  array_agg(story.abstract.context) AS context,
  story.content.status,
  story.content.content_type
FROM story.message
--INNER JOIN client.passport ON client.passport.id = story.message.creator -- todo поддержать
INNER JOIN client.bot ON client.bot.id = story.message.publisher
INNER JOIN story.content ON story.content.message_id = story.message.id
INNER JOIN story.abstract ON story.abstract.content_id = story.content.id
GROUP BY
  story.message.id,
  story.content.id,
--  client.passport.id, -- todo поддержать
  client.bot.id;
