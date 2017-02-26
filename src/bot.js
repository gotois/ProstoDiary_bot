const client = require('./database.client');

client.connect(error => {
  if (error) {
    console.error(error);
    throw error;
  }
  const bot = require('./bot.config');
  bot.getMe().then(() => {
    console.log('Bot started');
    require('./events/bot.events.js');
  });
});
