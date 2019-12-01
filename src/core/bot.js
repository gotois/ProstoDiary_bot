const TelegramBot = require('node-telegram-bot-api');
const logger = require('../services/logger.service');
const { telegram, botCommands } = require('../controllers');
const {
  IS_PRODUCTION,
  IS_AVA_OR_CI,
  TELEGRAM,
  SERVER,
  NGROK,
} = require('../environment');
let telegramBot;
if (IS_AVA_OR_CI) {
  telegramBot = new TelegramBot(TELEGRAM.TOKEN, {
    polling: true,
    baseApiUrl: TELEGRAM.API_URL,
  });
  telegramBot.startPolling({ restart: false });
} else if (IS_PRODUCTION) {
  telegramBot = new TelegramBot(TELEGRAM.TOKEN);
  telegramBot.setWebHook(`${SERVER.HEROKUAPP}/bot${TELEGRAM.TOKEN}`, {
    max_connections: 10,
  });
  telegramBot.on('webhook_error', (error) => {
    logger.log('error', error.toString());
  });
} else {
  telegramBot = new TelegramBot(TELEGRAM.TOKEN);
  if (NGROK.URL) {
    telegramBot.setWebHook(`${SERVER.HOST}/bot${TELEGRAM.TOKEN}`, {
      max_connections: 3,
    });
    telegramBot.on('webhook_error', (error) => {
      logger.log('error', error.toString());
    });
  } else {
    telegramBot.startPolling({ restart: false });
    telegramBot.on('polling_error', (error) => {
      logger.log('error', error.toString());
    });
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {undefined}
 */
const checkMessage = (message) => {
  // Пропускаем команды бота
  if (Array.isArray(message.entities)) {
    if (message.entities[0].type === 'bot_command') {
      // Пропускаем зарезервированные команды
      const commandReserved = botCommands.some((command) => {
        return message.text.search(telegram[command].alias) >= 0;
      });
      if (!commandReserved) {
        throw new Error('Unknown command. Enter /help');
      }
    }
  }
};
/**
 * @param {TelegramMessage} message - message
 * @param {object} obj - matcher
 * @param {string} obj.type - matcher type
 * @returns {undefined}
 */
const messageListener = async (message, { type }) => {
  try {
    if (message.reply_to_message instanceof Object) {
      if (!message.reply_to_message.from.is_bot) {
        throw new Error('Reply message not supported');
      }
    }
    switch (type) {
      case 'text': {
        checkMessage(message);
        if (message.reply_to_message) {
          return;
        }
        for (const key of botCommands) {
          if (telegram[key].alias.test(message.text)) {
            await require('../controllers/telegram/' + telegram[key].event)(
              message,
            );
            return;
          }
        }
        await require('../controllers/telegram/text.event')(message);
        break;
      }
      case 'photo': {
        await require('../controllers/telegram/photo.event')(message);
        break;
      }
      case 'document': {
        await require('../controllers/telegram/document.event')(message);
        break;
      }
      case 'location': {
        await require('../controllers/telegram/location.event')(message);
        break;
      }
      case 'voice': {
        await require('../controllers/telegram/voice.event')(message);
        break;
      }
      default: {
        throw new Error(`Unknown ${type}. Enter /help`);
      }
    }
  } catch (error) {
    logger.error(error.stack);
    await telegramBot.sendMessage(message.chat.id, error.message);
  }
};
telegramBot.on('message', messageListener);
/**
 * @type {TelegramBot}
 */
module.exports = telegramBot;
