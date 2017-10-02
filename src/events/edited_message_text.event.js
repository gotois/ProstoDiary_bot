const sessions = require('../services/session.service');
const bot = require('./../config/bot.config');
const dbEntries = require('../database/bot.database');
const crypt = require('../services/crypt.service');
const format = require('../services/format.service');
/***
 * Обновление текста в БД
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.from {Object}
 * @param msg.text {String}
 * @param msg.message_id {String}
 * @return {void}
 */
const onEditedMessageText = async ({chat, from, text, message_id}) => {
  const chatId = chat.id;
  const input = text.trim();
  if (input.startsWith('/')) {
    await bot.sendMessage(chatId, 'Редактирование этой записи невозможно');
    return;
  }
  const currentUser = sessions.getSession(from.id);
  if (input === 'del') {
    try {
      await dbEntries.delete(currentUser.id, message_id);
      await bot.sendMessage(chatId, 'Запись удалена');
    } catch (error) {
      console.error(error);
      await bot.sendMessage(chatId, error.toLocaleString());
    }
  } else {
    try {
      await dbEntries.put(currentUser.id, crypt.encode(input), new Date(), message_id);
      await bot.sendMessage(chatId, format.prevInput(input) + '\n_Запись обновлена_', {
        'parse_mode': 'Markdown',
      });
    } catch (error) {
      console.error(error);
      await bot.sendMessage(chatId, error.toLocaleString());
    }
  }
};

module.exports = onEditedMessageText;
