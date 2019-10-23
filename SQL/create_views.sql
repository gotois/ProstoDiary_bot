-- TODO: для селекта роли bot делаем ограничения на доступ к определенным полям

-- История пользователя представлена как "процесс"
-- todo нужен timestamp (SmartDate from - until) высчитываемый для истории. Возможно будет хорошей идеей генерировать уникальный view на каждый день
CREATE MATERIALIZED VIEW IF NOT EXISTS history_eat AS
SELECT *
FROM abstract
WHERE tags @> '{"eat"}';

CREATE MATERIALIZED VIEW IF NOT EXISTS history_script AS
SELECT *
FROM abstract
WHERE tags @> '{"script"}';

-- todo аналогично строить для каждого TAG
