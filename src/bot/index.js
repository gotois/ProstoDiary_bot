const TelegramBot = require('node-telegram-bot-api');
const { IS_PRODUCTION, IS_DEV, TELEGRAM, SERVER } = require('../env');
/**
 * @type TelegramBot
 */
let bot;
if (process.env.SERVER_NAME === 'TEST-AVA-SERVER') {
  const botOptions = { polling: true, baseApiUrl: 'http://localhost:9001' };
  bot = new TelegramBot(process.env.TELEGRAM_TOKEN, botOptions);
} else if (Object.prototype.hasOwnProperty.call(global, 'bot')) {
  bot = global.bot;
} else {
  if (IS_PRODUCTION && !IS_DEV) {
    bot = new TelegramBot(TELEGRAM.TOKEN, { webHook: { port: SERVER.PORT } });
  } else {
    bot = new TelegramBot(TELEGRAM.TOKEN, { polling: true });
  }
}

module.exports = bot;
