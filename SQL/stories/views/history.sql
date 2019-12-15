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
  story.content.content_type
FROM story.message
INNER JOIN passport.user ON passport.user.id = story.message.creator
INNER JOIN passport.bot ON passport.bot.id = story.message.publisher
INNER JOIN story.content ON story.content.message_id = story.message.id;
