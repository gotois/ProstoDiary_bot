const TelegramBot = require('node-telegram-bot-api');
const {
  IS_PRODUCTION,
  IS_AVA,
  IS_CI,
  TELEGRAM,
  SERVER,
} = require('../environment');
let bot;
if (Object.prototype.hasOwnProperty.call(global, 'bot')) {
  bot = global.bot;
} else if (IS_AVA || IS_CI) {
  bot = new TelegramBot(TELEGRAM.TOKEN, {
    polling: true,
    baseApiUrl: TELEGRAM.API_URL,
  });
} else if (IS_PRODUCTION) {
  bot = new TelegramBot(TELEGRAM.TOKEN, {
    webHook: { port: SERVER.PORT },
  });
} else {
  bot = new TelegramBot(TELEGRAM.TOKEN, {
    polling: true,
    baseApiUrl: TELEGRAM.API_URL,
  });
}
/**
 * @type {TelegramBot}
 */
module.exports = bot;
