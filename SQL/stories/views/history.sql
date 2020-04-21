CREATE MATERIALIZED VIEW public.story AS
SELECT
  story.message.id,
  story.message.version,
  story.message.publisher AS publisher,
  story.message.updated_at::DATE,
  story.message.revision,
  client.bot.email AS creator,
  story.content.created_at::DATE,
  story.content.content,
  story.content.schema AS type,
  array_agg(story.abstract.category) AS categories,
  jsonb_agg(story.abstract.context) AS context,
  story.content.status,
  story.content.content_type
FROM story.message
INNER JOIN client.bot ON client.bot.email = story.message.creator
INNER JOIN story.content ON story.content.message_id = story.message.id
LEFT JOIN story.abstract ON story.abstract.content_id = story.content.id
GROUP BY
  story.message.id,
  story.content.id,
  client.bot.id;
