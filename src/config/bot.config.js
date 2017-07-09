const TelegramBot = require('node-telegram-bot-api');
const {PRODUCTION_MODE} = require('./constants.config');
const {TOKEN, PORT, NODE_ENV, HEROKU_NAME} = process.env;
/**
 * @type TelegramBot
 */
const bot = (NODE_ENV === PRODUCTION_MODE)
  ? new TelegramBot(TOKEN, {webHook: {port: PORT}})
  : new TelegramBot(TOKEN, {polling: true});
if (NODE_ENV === PRODUCTION_MODE) {
  bot.setWebHook(`https://${HEROKU_NAME}.herokuapp.com/bot${TOKEN}`);
}

module.exports = bot;
