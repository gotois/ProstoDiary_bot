CREATE MATERIALIZED VIEW public.story AS
SELECT
  story.message.id,
  story.message.version,
  story.content.created_at::DATE,
  story.message.updated_at::DATE,
  story.message.revision,
  passport.user.email AS creator_email,
  passport.bot.email AS publisher_email,
  story.content.content,
  array_agg(story.abstract.category) AS categories,
  story.content.status,
  story.content.content_type
FROM story.message
INNER JOIN passport.user ON passport.user.id = story.message.creator
INNER JOIN passport.bot ON passport.bot.id = story.message.publisher
INNER JOIN story.content ON story.content.message_id = story.message.id
INNER JOIN story.abstract ON story.abstract.content_id = story.content.id
GROUP BY story.message.id, story.content.id, passport.user.id, passport.bot.id;
