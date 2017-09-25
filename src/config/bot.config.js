const TelegramBot = require('node-telegram-bot-api');
const {PRODUCTION_MODE} = require('./constants.config');
const {TOKEN, PORT, NODE_ENV, HEROKU_NAME} = process.env;
const isProduction = (NODE_ENV === PRODUCTION_MODE);
/**
 * @type TelegramBot
 */
const bot = (isProduction)
  ? new TelegramBot(TOKEN, {webHook: {port: PORT}})
  : new TelegramBot(TOKEN, {polling: true});
if (isProduction) {
  bot.setWebHook(`https://${HEROKU_NAME}.herokuapp.com/bot${TOKEN}`);
}

module.exports = bot;
