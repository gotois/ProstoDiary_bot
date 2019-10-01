const bot = require('../core/bot');
const commands = require('../core/commands');
const format = require('../services/format.service');
const logger = require('../services/logger.service');
const APIv2 = require('../api/v2');
const kppAPI = require('../api/v1/kpp');
const { IS_AVA_OR_CI } = require('../environment');
/**
 * @typedef {number} COMMANDS_ENUM
 **/
/**
 * @readonly
 * @enum {COMMANDS_ENUM}
 */
const COMMANDS_ENUM = {
  TELEGRAM_COMMAND: 0,
  TEXT: 1, // Запись в виде неформатированного текста
  KPP: 2, // 'Просмотр информации по своему кассовому чеку `String`'
};
/**
 * @todo https://github.com/gotois/ProstoDiary_bot/issues/74
 * @param {string} input - input text
 * @returns {COMMANDS_ENUM}
 */
const getInputType = (input) => {
  const isKPP = ['t=', 's=', 'fn=', 'i=', 'fp=', 'n='].every((value) => {
    return input.includes(value);
  });
  if (isKPP) {
    return COMMANDS_ENUM.KPP;
  }
  if (input.startsWith('/')) {
    return COMMANDS_ENUM.TELEGRAM_COMMAND;
  }
  return COMMANDS_ENUM.TEXT;
};
/**
 * @todo смержить с getInputType
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
 * @param {any} match - matcher
 * @returns {undefined}
 */
const onText = async (message, match) => {
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
  // Пропускаем команды бота от AVA Server
  if (IS_AVA_OR_CI) {
    if (text.startsWith('/')) {
      return;
    }
  }
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
  if (match.type !== 'text') {
    return;
  }
  const botMessage = await bot.sendMessage(
    chatId,
    `_${format.previousInput(text)}_ 📝`,
    {
      parse_mode: 'Markdown',
      disable_notification: true,
      disable_web_page_preview: true,
    },
  );
  let errorAPIMessage;
  let resultAPIMessage;
  switch (getInputType(text)) {
    case COMMANDS_ENUM.KPP: {
      logger.log('info', 'onKPP');
      const { error, result } = await kppAPI(text);
      errorAPIMessage = error;
      resultAPIMessage = JSON.stringify(result, null, 2);
      break;
    }
    case COMMANDS_ENUM.TEXT: {
      logger.log('info', 'onText');
      const { error, result } = await APIv2.insert(Buffer.from(text), {
        type: 'plain/text',
        date,
        telegram_user_id: from.id,
        telegram_message_id: message_id,
      });
      errorAPIMessage = error;
      resultAPIMessage = result;
      break;
    }
    default: {
      errorAPIMessage = {
        message: 'Unknown command',
      };
      break;
    }
  }
  if (errorAPIMessage) {
    logger.log('error', errorAPIMessage.message.toString());
    await bot.editMessageText(errorAPIMessage.message, {
      chat_id: botMessage.chat.id,
      message_id: botMessage.message_id,
    });
    return;
  }
  await bot.editMessageText(resultAPIMessage, {
    chat_id: botMessage.chat.id,
    message_id: botMessage.message_id,
  });
};

module.exports = onText;
