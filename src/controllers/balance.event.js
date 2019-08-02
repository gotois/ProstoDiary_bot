// todo: https://github.com/gotois/ProstoDiary_bot/issues/39
const bot = require('../core');
const logger = require('../services/logger.service');
/**
 * @function
 * @param {object} msg - msg
 * @param {object} msg.chat - chat
 * @returns {Promise<undefined>}
 */
const getBalance = async ({ chat }) => {
  logger.log('info', getBalance.name);
  const chatId = chat.id;
  const balanceAPI = require('../api/v1/balance');
  try {
    const balanceResult = await balanceAPI();
    await bot.sendMessage(chatId, balanceResult, {
      parse_mode: 'Markdown',
    });
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, 'Ошибка');
  }
};

module.exports = getBalance;
