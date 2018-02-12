const sessions = require('../services/session.service');
const bot = require('./../config/bot.config');
const crypt = require('../services/crypt.service');
const format = require('../services/format.service');
const commands = require('../commands/bot.commands');
const dbEntries = require('../database/bot.database');
const logger = require('../services/logger.service');
/***
 * Все что пишешь - записывается в сегодняшний день
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.from {Object}
 * @param msg.text {String}
 * @param msg.reply_to_message {Object}
 * @param msg.message_id {Number}
 * @param msg.date {Date}
 * @return {void}
 */
const onText = async ({chat, from, text, reply_to_message, message_id, date}) => {
  const chatId = chat.id;
  const fromId = from.id;
  const input = text.trim();
  // Пропускаем Reply сообщений
  if (reply_to_message instanceof Object) {
    return;
  }
  // Пропускаем зарезервированные команды
  for (const command of Object.keys(commands)) {
    if (input.search(commands[command]) >= 0) {
      return;
    }
  }
  if (input.startsWith('/')) {
    await bot.sendMessage(chatId, 'Такой комманды нет. Нажмите /help для помощи');
    return;
  }
  const currentUser = sessions.getSession(fromId);
  try {
    await dbEntries.post(currentUser.id, crypt.encode(input), message_id, new Date(date * 1000));
    const text = format.prevInput(input);
    await bot.sendMessage(chatId, text, {
      'disable_notification': true,
      'disable_web_page_preview': true,
    });
  } catch (error) {
    await bot.sendMessage(chatId, error.toString());
    logger.log('error', error);
  }
};

module.exports = onText;
