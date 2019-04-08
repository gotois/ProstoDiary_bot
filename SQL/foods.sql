CREATE TABLE IF NOT EXISTS foods (
  id SERIAL primary key,
  name TEXT unique,
  protein NUMERIC (5, 2),
  fat NUMERIC (5, 2),
  carbohydrate NUMERIC (5, 2),
  kcal NUMERIC (5)
);
