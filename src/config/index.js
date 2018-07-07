const TelegramBot = require('node-telegram-bot-api');
const {IS_PRODUCTION, TOKEN, PORT, HEROKU_NAME} = require('../env');
/**
 * @type TelegramBot
 */
const bot = (IS_PRODUCTION)
  ? new TelegramBot(TOKEN, {webHook: {port: PORT}})
  : new TelegramBot(TOKEN, {polling: true});
if (IS_PRODUCTION) {
  bot.setWebHook(`https://${HEROKU_NAME}.herokuapp.com/bot${TOKEN}`);
}

module.exports = bot;
