-- выбираем последний json-ld для соответствующего passport_id (NULL для теста) c добавлением информации о боте
DROP VIEW IF EXISTS person CASCADE;
  -- нужно только view, без проверки на passport_id и order_by limit. (это делать средствами slonik'a)
CREATE VIEW person AS
  SELECT
  ld.jsonld,
  bot.activated,
  bot.email,
  bot.password
  FROM ld INNER JOIN bot ON bot.passport_id = 'c43c0596-fecb-4cde-afb5-048227ff92dc'
  ORDER BY ld.created_at DESC LIMIT 1;

