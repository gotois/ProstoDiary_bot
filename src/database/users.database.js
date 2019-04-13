const { $$ } = require('./index');
/**
 *
 * @param {number} telegramUserId - id
 */
const check = (telegramUserId) => {
  return $$(
    `SELECT 1 from users
    WHERE telegram_user_id=$1`,
    [telegramUserId],
  );
};
/**
 *
 * @param {number} telegramUserId - id
 */
const post = (telegramUserId) => {
  return $$(
    `INSERT INTO users (telegram_user_id)
    values ($1)`,
    [telegramUserId],
  );
};

module.exports = {
  post,
  check,
};
