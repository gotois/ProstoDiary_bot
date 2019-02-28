const $$ = require('./database.promise.js');
/**
 *
 * @param {*} telegram_user_id - id
 */
const check = (telegram_user_id) => {
  return $$(
    `SELECT 1 from users
    WHERE telegram_user_id=$1`,
    [telegram_user_id],
  );
};
/**
 *
 * @param {*} telegram_user_id - id
 */
const post = (telegram_user_id) => {
  return $$(
    `INSERT INTO users (telegram_user_id)
    values ($1)`,
    [telegram_user_id],
  );
};

module.exports = {
  post,
  check,
};
