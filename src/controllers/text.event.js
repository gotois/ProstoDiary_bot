const bot = require('../bot');
const sessions = require('../services/session.service');
const logger = require('../services/logger.service');
const textAPI = require('../api/v1/text');
/**
 * Все что пишешь - записывается в сегодняшний день
 *
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @param {object} msg.from - from
 * @param {string} msg.text - text
 * @param {object} msg.reply_to_message - message
 * @param {number} msg.message_id - id message
 * @param {Date} msg.date -date message
 * @returns {undefined}
 */
const onText = async ({
  chat,
  from,
  text,
  reply_to_message,
  message_id,
  date,
}) => {
  logger.log('info', onText.name);
  // Пропускаем Reply сообщений
  if (reply_to_message instanceof Object) {
    return;
  }
  const chatId = chat.id;
  const fromId = from.id;
  const currentUser = sessions.getSession(fromId);
  try {
    const result = await textAPI(text, message_id, date, currentUser);
    // todo: похоже что параметры срабатывают неправильнго
    await bot.sendMessage(chatId, result, {
      disable_notification: true,
      disable_web_page_preview: true,
    });
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, error.toString());
  }
};

module.exports = onText;
