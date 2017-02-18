const $$ = require('./database.promise');
/**
 *
 * @param telegram_user_id
 */
function check(telegram_user_id) {
  return $$(
    `SELECT 1 from users 
    WHERE telegram_user_id=$1`,
    [telegram_user_id]
  );
}
/**
 *
 * @param telegram_user_id
 */
function post(telegram_user_id) {
  return $$(
    `INSERT INTO users (telegram_user_id) 
    values ($1)`,
    [telegram_user_id]
  );
}

module.exports = {
  post,
  check
};
