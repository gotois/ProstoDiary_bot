const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN;
const port = process.env.PORT;
const mode = process.env.NODE_ENV;
let bot;

if (mode === 'production') {
  const url = `https://${process.env.HEROKU_NAME}.herokuapp.com/bot${token}`;
  bot = new TelegramBot(token, {webHook: {port}});
  bot.setWebHook(url);
} else {
  bot = new TelegramBot(token, {polling: true});
}

module.exports = bot;
