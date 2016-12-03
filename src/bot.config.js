const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN;
const port = process.env.PORT;
const mode = process.env.NODE_ENV;

if (mode === 'production') {
  const bot = new TelegramBot(token, {webHook: {port}});
  const url = `https://${process.env.HEROKU_NAME}.herokuapp.com/bot${token}`;
  bot.setWebHook(url);
  module.exports = bot;
} else {
  const bot = new TelegramBot(token, {polling: true});
  module.exports = bot;
}
