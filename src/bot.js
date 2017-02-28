const client = require('./database/database.client.js');

client.connect(connect);
/**
 *
 * @param error {Object|undefined}
 */
function connect(error) {
  if (error) {
    console.error(error);
    throw error;
  }
  const bot = require('./config/bot.config.js');
  bot.getMe().then(() => {
    console.log('Bot started');
    require('./bot.events/bot.events.js');
  }).catch(error => {
    console.error(error);
  });
}
