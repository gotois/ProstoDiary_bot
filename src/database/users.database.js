const { $$ } = require('.');
/**
 * @param {number} telegramUserId - id
 * @returns {Promise}
 */
const exist = async (telegramUserId) => {
  const result = await $$(
    `SELECT 1 FROM users
    WHERE telegram_user_id = $1`,
    [telegramUserId],
  );
  return result;
};
/**
 * @todo отдавать только те, что активные
 * @returns {Promise<Array<object>>}
 */
const getAllTelegramUserIds = async () => {
  const result = await $$('SELECT DISTINCT telegram_user_id FROM bot_story');
  return result.rows;
};

module.exports = {
  getAllTelegramUserIds,
  exist,
};
