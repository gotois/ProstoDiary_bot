-- todo перенести это в стороннего ассистента https://github.com/gotois/nutrition_bot
-- Все на 100 гр. продукта
CREATE UNLOGGED TABLE IF NOT EXISTS foods (
  id SERIAL PRIMARY KEY,
  title TEXT UNIQUE, -- нужен индекс по этому
  protein NUMERIC (5, 2) default NULL,
  fat NUMERIC (5, 2) default NULL,
  carbohydrate NUMERIC (5, 2) default NULL,
  kcal NUMERIC (5) default NULL
);

-- Хранимая процедура поиска по title мультиязычно
CREATE OR REPLACE FUNCTION to_tsvector_multilang (title TEXT) RETURNS tsvector as $$
SELECT to_tsvector('russian', $1) ||
       to_tsvector('english', $1) ||
       to_tsvector('simple', $1)
$$ LANGUAGE SQL IMMUTABLE;

-- Полнотекстовый поиск по тайтлу
CREATE INDEX idx_gin_foods ON foods USING GIN (to_tsvector_multilang(title));
