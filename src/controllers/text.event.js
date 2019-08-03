const bot = require('../core');
const commands = require('../core/commands');
const sessions = require('../services/session.service');
const logger = require('../services/logger.service');
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
  const chatId = chat.id;
  if (reply_to_message instanceof Object) {
    await bot.sendMessage(chatId, 'Reply message not supported');
    return;
  }
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
  const textAPI = require('../api/v1/text');
  const { error, result } = await textAPI(text, date, currentUser, message_id);
  if (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, error.toString());
    return;
  }
  await bot.sendMessage(chatId, result, {
    disable_notification: true,
    disable_web_page_preview: true,
  });
};

module.exports = onText;
