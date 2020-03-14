const TelegramBot = require('node-telegram-bot-api');
const logger = require('../../services/logger.service');
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
require('./listeners')(telegramBot);
/**
 * @type {TelegramBot}
 */
module.exports = telegramBot;
