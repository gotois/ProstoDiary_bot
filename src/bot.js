const client = require('./database/database.client');
/**
 *
 * @param error {Object|undefined}
 */
const connect = async error => {
  if (error) {
    console.error(error);
    throw error;
  }
  await require('./config/bot.config').getMe();
  try {
    await require('./events/bot.events');
  } catch (error) {
    console.error(error);
  }
};

client.connect(connect);
