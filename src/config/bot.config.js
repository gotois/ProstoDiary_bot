const TelegramBot = require('node-telegram-bot-api');
const {PRODUCTION_MODE} = require('./constants.config');
const {TOKEN, PORT, NODE_ENV} = process.env;
/**
 * @type TelegramBot
 */
const bot = (() => {
  if (NODE_ENV === PRODUCTION_MODE) {
    const url = `https://${process.env.HEROKU_NAME}.herokuapp.com/bot${TOKEN}`;
    return (new TelegramBot(TOKEN, {webHook: {PORT}})).setWebHook(url);
  } else {
    return new TelegramBot(TOKEN, {polling: true});
  }
})();

module.exports = bot;
