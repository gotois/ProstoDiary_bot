// todo: rename -> bot.js
const TelegramBot = require('node-telegram-bot-api');
const { IS_PRODUCTION, IS_DEV, TELEGRAM, SERVER } = require('../environment');
let bot;
if (Object.prototype.hasOwnProperty.call(global, 'bot')) {
  bot = global.bot;
} else if (process.env.SERVER_NAME === 'TEST-AVA-SERVER') {
  bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
    polling: true,
    baseApiUrl: `http://localhost:${process.env.TELEGRAM_SERVER_PORT}`,
  });
} else if (IS_PRODUCTION && !IS_DEV) {
  bot = new TelegramBot(TELEGRAM.TOKEN, { webHook: { port: SERVER.PORT } });
} else {
  bot = new TelegramBot(TELEGRAM.TOKEN, { polling: true });
}
/**
 * @type TelegramBot
 */
module.exports = bot;
