const bot = require('../bot');
const commands = require('../bot/commands');
const sessions = require('../services/session.service');
const logger = require('../services/logger.service');
const textAPI = require('../api/v1/text');
/**
 * @description Проверка тексты на команды
 * @param {string} input - input string
 * @returns {boolean}
 */
const unknownCommand = (input) => {
  // Пропускаем зарезервированные команды
  for (const command of Object.keys(commands)) {
    if (input.search(commands[command].alias) >= 0) {
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
  entities,
}) => {
  logger.log('info', onText.name);
  // Пропускаем Reply сообщений
  if (reply_to_message instanceof Object) {
    return;
  }
  const chatId = chat.id;
  const fromId = from.id;
  const currentUser = sessions.getSession(fromId);
  // Пропускаем команды бота
  if (entities) {
    if (
      entities.some((entity) => {
        return entity.type === 'bot_command';
      })
    ) {
      if (!unknownCommand(text)) {
        await bot.sendMessage(chatId, 'Unknown command. Enter /help');
      }
      return;
    }
  }
  if (text.startsWith('/')) {
    return;
  }
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
