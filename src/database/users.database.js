const { $$ } = require('.');
const pkg = require('../../package');
/**
 * @param {number} telegramUserId - id
 * @param {number} message_id - id
 * @returns {Promise}
 */
const exist = async (telegramUserId) => {
  const result = await $$(
    `SELECT 1 FROM bot_story
    WHERE telegram_user_id = $1 AND version = $2`,
    [telegramUserId, pkg.version],
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
