const bot = require('../core');
const commands = require('../core/commands');
const format = require('../services/format.service');
const logger = require('../services/logger.service');
const APIv2 = require('../api/v2');
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
 * @param {object} message - message
 * @param {object} message.chat - chat
 * @param {object} message.from - from
 * @param {string} message.text - text
 * @param {object} message.reply_to_message - message
 * @param {number} message.message_id - id message
 * @param {number} message.date - unix time
 * @returns {undefined}
 */
const onText = async (message) => {
  const {
    chat,
    from,
    text,
    reply_to_message,
    message_id,
    date,
    entities,
  } = message;
  const chatId = chat.id;
  if (reply_to_message instanceof Object) {
    if (!reply_to_message.from.is_bot) {
      await bot.sendMessage(chatId, 'Reply message not supported');
    }
    return;
  }
  logger.log('info', onText.name);
  const fromId = from.id;
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
  const { error, result } = await APIv2.insert(Buffer.from(text), {
    type: 'plain/text',
    date,
    telegram_user_id: fromId,
    telegram_message_id: message_id,
  });
  if (error) {
    logger.log('error', error.message.toString());
    await bot.sendMessage(chatId, error.message.toString());
    return;
  }
  await bot.forwardMessage(chatId, from.id, message_id);
  await bot.sendMessage(chatId, result, {
    disable_notification: true,
    disable_web_page_preview: true,
  });
};

module.exports = onText;
