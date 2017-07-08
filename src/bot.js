const client = require('./database/database.client');

/**
 *
 * @param error {Object|undefined}
 */
const connect = (error) => {
  if (error) {
    console.error(error);
    throw error;
  }
  const bot = require('./config/bot.config');
  bot.getMe().then(() => {
    console.log('Bot started');
    require('./events/bot.events');
  }).catch(error => {
    console.error(error);
  });
};

client.connect(connect);
