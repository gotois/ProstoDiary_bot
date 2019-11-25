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
  telegramBot = new TelegramBot(TELEGRAM.TOKEN, {
    webHook: { port: SERVER.PORT },
  });
  telegramBot.setWebHook(`${SERVER.HOST}/bot${TELEGRAM.TOKEN}`);
  telegramBot.on('webhook_error', (error) => {
    logger.log('error', error.toString());
  });
} else {
  telegramBot = new TelegramBot(TELEGRAM.TOKEN);
  if (NGROK.URL) {
    telegramBot.setWebHook(`${SERVER.HOST}/bot${TELEGRAM.TOKEN}`);
    telegramBot.on('polling_error', (error) => {
      logger.log('error', error.toString());
    });
  } else {
    telegramBot.startPolling({ restart: false });
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {?throws}
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
 */
const messageListener = (message, { type }) => {
  try {
    if (message.reply_to_message instanceof Object) {
      if (!message.reply_to_message.from.is_bot) {
        throw new Error('Reply message not supported');
      }
    }
    switch (type) {
      case 'text': {
        checkMessage(message);
        for (const key of botCommands) {
          if (telegram[key].alias.test(message.text)) {
            require('../controllers/telegram/' + telegram[key].event)(message);
            return;
          }
        }
        require('../controllers/telegram/text.event')(message);
        break;
      }
      case 'photo': {
        require('../controllers/telegram/photo.event')(message);
        break;
      }
      case 'document': {
        require('../controllers/telegram/document.event')(message);
        break;
      }
      case 'location': {
        require('../controllers/telegram/location.event')(message);
        break;
      }
      case 'voice': {
        require('../controllers/telegram/voice.event')(message);
        break;
      }
      default: {
        throw new Error(`Unknown ${type}. Enter /help`);
      }
    }
  } catch (error) {
    logger.error(error.stack);
    telegramBot.sendMessage(message.chat.id, error.message);
  }
};
telegramBot.on('message', messageListener);
/**
 * @type {TelegramBot}
 */
module.exports = telegramBot;
