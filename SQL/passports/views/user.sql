CREATE VIEW user AS
  SELECT
  passport.id,
  passport.email, -- todo брать тот на который была первая регистрация
  passport.telegram_id,
  passport.facebook_id,
  passport.yandex_id;
