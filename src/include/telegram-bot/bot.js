const TelegramBot = require('node-telegram-bot-api');
const logger = require('../../lib/log');
const {
  IS_PRODUCTION,
  IS_CRON,
  IS_AVA_OR_CI,
  TELEGRAM,
  SERVER,
  NGROK,
} = require('../../environment');
let telegramBot;
if (IS_AVA_OR_CI || IS_CRON) {
  telegramBot = new TelegramBot(TELEGRAM.TOKEN, {
    polling: true,
    baseApiUrl: TELEGRAM.API_URL,
  });
  telegramBot.startPolling({ restart: false });
  telegramBot.on('polling_error', (error) => {
    logger.error(error.toString());
  });
} else if (IS_PRODUCTION) {
  telegramBot = new TelegramBot(TELEGRAM.TOKEN);
  telegramBot
    .setWebHook(`${SERVER.HEROKUAPP}/bot${TELEGRAM.TOKEN}`, {
      max_connections: 10,
    })
    .then(() => {
      logger.info('set webhook completed');
    })
    .catch((error) => {
      logger.error(error.message);
    });
  telegramBot.on('webhook_error', (error) => {
    logger.error(error.toString());
  });
} else if (NGROK.URL) {
  telegramBot = new TelegramBot(TELEGRAM.TOKEN);
  telegramBot
    .setWebHook(`${SERVER.HOST}/bot${TELEGRAM.TOKEN}`, {
      max_connections: 3,
    })
    .then(() => {
      logger.info('set webhook completed');
    })
    .catch((error) => {
      logger.error(error.message);
    });
  telegramBot.on('webhook_error', (error) => {
    logger.error(error.toString());
  });
} else {
  telegramBot = new TelegramBot(TELEGRAM.TOKEN);
  telegramBot.startPolling({ restart: false });
  telegramBot.on('polling_error', (error) => {
    logger.error(error.toString());
  });
}
require('./listeners')(telegramBot);
/**
 * @type {TelegramBot}
 */
module.exports = telegramBot;
