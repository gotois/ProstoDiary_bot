const { $$ } = require('./index');
/**
 * TODO: сделать аналогично entities/exist
 *
 * @param {number} telegramUserId - id
 * @returns {Promise}
 */
const check = async (telegramUserId) => {
  const res = await $$(
    `SELECT 1 FROM users
    WHERE telegram_user_id = $1`,
    [telegramUserId],
  );
  return res;
};
/**
 *
 * @param {number} telegramUserId - id
 * @returns {Promise}
 */
const post = async (telegramUserId) => {
  const res = await $$(
    `INSERT INTO users (telegram_user_id)
    VALUES ($1)`,
    [telegramUserId],
  );
  return res;
};

module.exports = {
  post,
  check,
};
