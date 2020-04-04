CREATE VIEW client.roles AS
SELECT
  client.bot.email,
  'bot' AS role
FROM
  client.bot
UNION
SELECT
  client.passport.email,
  'user' AS role
FROM
  client.passport
