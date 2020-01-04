-- эти категории должны быть продублированы в Search ассистенте в Dialogflow Intents
CREATE TYPE CATEGORY AS ENUM (
'undefined',
'text',
'video',
'photo',
'location',
'script',
'weather',
'todo',
'work',
'idea',
'buy',
'sex',
'contract',
'love',
'eat',
'finance',
'fitness',
'health',
'meet',
'pain',
'weight',
'height', -- Смена роста
'family', -- Изменения в Семья
'job', -- Здесь же смена уровня дохода | новая цели в карьере
'birthday',-- Указание День рождения
'hobby',
'social',-- Новое сообщество
'mood'-- настроение и твореческое выражение
);
