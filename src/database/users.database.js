const { $$ } = require('.');
/**
 * TODO: сделать аналогично entities/exist
 *
 * @param {number} telegramUserId - id
 * @returns {Promise}
 */
const check = async (telegramUserId) => {
  const result = await $$(
    `SELECT 1 FROM users
    WHERE telegram_user_id = $1`,
    [telegramUserId],
  );
  return result;
};
/**
 *
 * @param {number} telegramUserId - id
 * @returns {Promise}
 */
const post = async (telegramUserId) => {
  const result = await $$(
    `INSERT INTO users (telegram_user_id)
    VALUES ($1)`,
    [telegramUserId],
  );
  return result;
};

module.exports = {
  post,
  check,
};
