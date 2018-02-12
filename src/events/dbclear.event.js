const dbEntries = require('../database');
const sessions = require('../services/session.service');
const bot = require('../config');
const logger = require('../services/logger.service');
/***
 * Очистить базу данных с подтверждением
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.from {Object}
 * @return {void}
 */
const onDBClear = async ({chat, from}) => {
  const chatId = chat.id;
  const fromId = from.id;
  const options = {
    'reply_markup': {
      'force_reply': true
    }
  };
  const currentUser = sessions.getSession(fromId);
  const {message_id} = await bot.sendMessage(chatId, 'Очистить ваши записи?\nНапишите: YES', options);
  await bot.onReplyToMessage(chat.id, message_id, async ({text}) => {
    if (text !== 'YES') {
      await bot.sendMessage(chat.id, 'Операция отменена');
      return;
    }
    try {
      await dbEntries.clear(currentUser.id);
      await bot.sendMessage(chat.id, 'Данные очищены');
    } catch (error) {
      logger.log('error', error);
      await bot.sendMessage(chat.id, 'Ошибка в операции');
    }
  });
};

module.exports = onDBClear;
