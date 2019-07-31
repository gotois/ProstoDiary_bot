const bot = require('../bot');
const sessions = require('../services/session.service');
const logger = require('../services/logger.service');
const editedMessageTextAPI = require('../api/v1/edited-message-text');
/**
 * Обновление текста в БД
 *
 * @param {object} msg - msg
 * @param {object} msg.chat - chat
 * @param {object} msg.from - from
 * @param {string} msg.text - text
 * @param {string} msg.message_id - message
 * @returns {undefined}
 */
const onEditedMessageText = async ({ chat, from, text, date, message_id }) => {
  logger.log('info', onEditedMessageText.name);
  const chatId = chat.id;
  const currentUser = sessions.getSession(from.id);
  try {
    const textResult = await editedMessageTextAPI(
      text,
      date,
      message_id,
      currentUser,
    );
    await bot.sendMessage(chatId, textResult, {
      parse_mode: 'Markdown',
    });
  } catch (error) {
    logger.error(error);
    await bot.sendMessage(chatId, error.toLocaleString());
  }
};

module.exports = onEditedMessageText;
