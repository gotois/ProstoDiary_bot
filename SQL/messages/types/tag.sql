CREATE TYPE TAG AS ENUM (
'undefined',
'script',
'buy',
'weather',
'sex',
'contract', -- информа­цию о состоянии текущих контрактов
'eat',
'finance',
'fitness',
'health',
'meet',
'pain',
'todo',
'weight',
'height', -- Смена роста
'family', -- Изменения в Семья
'work', -- смена вид деятельности
'job', -- Здесь же смена уровня дохода | новая цели в карьере
'birthday',-- Указание День рождения
'hobby',
'relationship', -- Изменения в отношениях
'social',-- Новое сообщество
'mood',-- настроение и твореческое выражение
'gender'-- гендер и любое его изменение
-- todo прочие изменения биометрики
);
