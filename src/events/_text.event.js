const sessions = require('../services/sessions');
const bot = require('./../config/bot.config');
const crypt = require('../services/crypt');
const format = require('../services/format');
const commands = require('../commands/bot.commands');
const dbEntries = require('../database/bot.database');
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
function onText({chat, from, text, reply_to_message, message_id, date}) {
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
    bot.sendMessage(chatId, 'Такой комманды нет. Нажмите /help для помощи');
    return;
  }
  const currentUser = sessions.getSession(fromId);
  dbEntries.post(currentUser.id, crypt.encode(input), message_id, new Date(date * 1000)).then(() => {
    const text = format.prevInput(input);
    return bot.sendMessage(chatId, text);
  }).catch(error => {
    return bot.sendMessage(chatId, error);
  });
}

module.exports = onText;
