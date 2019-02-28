const TelegramBot = require('node-telegram-bot-api');
const { IS_PRODUCTION, TOKEN, PORT, HEROKU_NAME } = require('../env');
/**
 * @type TelegramBot
 */
let bot;
if (global.hasOwnProperty('bot')) {
  bot = global.bot;
} else {
  if (IS_PRODUCTION) {
    bot = new TelegramBot(TOKEN, { webHook: { port: PORT } });
    bot.setWebHook(`https://${HEROKU_NAME}.herokuapp.com/bot${TOKEN}`);
  } else {
    bot = new TelegramBot(TOKEN, { polling: true });
  }
}

module.exports = bot;
