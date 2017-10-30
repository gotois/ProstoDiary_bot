const client = require('./database/database.client');
const logger = require('./services/logger.service');
/**
 * @param error {Object|undefined}
 */
const connect = async error => {
  if (error) {
    logger.log('error', error);
    throw new Error('Connect error');
  }
  await require('./config/bot.config').getMe();
  try {
    await require('./events/bot.events');
  } catch (error) {
    logger.log('error', error);
  }
  logger.log('info', 'server started');
};

client.connect(connect);
