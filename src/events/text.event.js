const bot = require('../bot');
const sessions = require('../services/session.service');
const crypt = require('../services/crypt.service');
const format = require('../services/format.service');
const commands = require('../commands');
const dbEntries = require('../database/entities.database');
const logger = require('../services/logger.service');
const { inputProcess } = require('../services/input.service');
/**
 * @description Проверка тексты на команды
 * @param {string} input - input string
 * @returns {boolean}
 */
const checkUnknownInput = (input) => {
  // Пропускаем зарезервированные команды
  for (const command of Object.keys(commands)) {
    if (input.search(commands[command]) >= 0) {
      return true;
    }
  }
  // TODO: https://github.com/gotois/ProstoDiary_bot/issues/74
  // ...
  return false;
};
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
  const originalText = text.trim();
  // Пропускаем Reply сообщений
  if (reply_to_message instanceof Object) {
    return;
  }
  if (originalText.startsWith('/')) {
    return;
  }
  const chatId = chat.id;
  const fromId = from.id;
  if (checkUnknownInput(originalText)) {
    await bot.sendMessage(chatId, 'Unknown command. Enter /help');
    return;
  }
  const currentUser = sessions.getSession(fromId);
  try {
    const story = await inputProcess(originalText);
    const storyDefinition = await story.definition();
    await bot.sendMessage(chatId, JSON.stringify(storyDefinition.meta));
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, error.toString());
    return;
  }
  // todo: https://github.com/gotois/ProstoDiary_bot/issues/98
  try {
    // todo: в БД записывать originalText
    // await story.save();
    // todo: перенести этот вызов в story.save
    await dbEntries.post(
      currentUser.id,
      crypt.encode(text),
      message_id,
      new Date(date * 1000),
    );
    const okText = format.previousInput(text);
    await bot.sendMessage(chatId, okText, {
      disable_notification: true,
      disable_web_page_preview: true,
    });
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, error.toString());
  }
};

module.exports = onText;
