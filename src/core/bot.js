const TelegramBot = require('node-telegram-bot-api');
const {
  IS_PRODUCTION,
  IS_AVA_OR_CI,
  TELEGRAM,
  SERVER,
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
} else {
  telegramBot = new TelegramBot(TELEGRAM.TOKEN);
  telegramBot.setWebHook(`${SERVER.HOST}/bot${TELEGRAM.TOKEN}`);
}
/**
 * @type {TelegramBot}
 */
module.exports = telegramBot;
