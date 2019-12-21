CREATE VIEW passport.roles AS
SELECT
  passport.bot.email,
  'bot' AS role
FROM
  passport.bot
UNION
SELECT
  passport.user.email,
  'user' AS role
FROM
  passport.user
