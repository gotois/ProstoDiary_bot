const bot = require('../core/bot');
const logger = require('../services/logger.service');
/**
 * /count - -> выведет сколько всего потрачено
 * /count + -> выведет сколько всего получено
 *
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @param {object} msg.from - from
 * @param {Array} match - mather
 * @returns {undefined}
 */
const onCount = async ({ chat, from }, match) => {
  logger.log('info', onCount.name);
  const chatId = chat.id;
  const fromId = from.id;
  const parameters = {
    parse_mode: 'Markdown',
  };
  const countAPI = require('../api/v1/count');
  if (match[1]) {
    try {
      const countResult = await countAPI(match[1].toUpperCase(), fromId);
      await bot.sendMessage(chatId, countResult, parameters);
    } catch (error) {
      await bot.sendMessage(chatId, error.message);
      logger.error(error);
    }
  } else {
    const replyParameters = Object.assign({}, parameters, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Всего потрачено', callback_data: '-' },
            { text: 'Всего получено', callback_data: '+' },
          ],
        ],
      },
    });
    await bot.sendMessage(chatId, 'Финансы', replyParameters);
    // TODO: возможна утечка, если не уничтожать слушатель
    bot.once('callback_query', async ({ data }) => {
      const countResult = await countAPI(data, fromId);
      await bot.sendMessage(chatId, countResult, parameters);
    });
  }
};

module.exports = onCount;
