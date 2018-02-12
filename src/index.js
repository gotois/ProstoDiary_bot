const client = require('./database/database.client');
const logger = require('./services/logger.service');
/**
 * @param error {Object|undefined}
 */
const connect = async error => {
  if (error) {
    logger.log({level: 'error', message: 'Connect error' + error});
    throw new Error('Connect error');
  }
  await require('./config').getMe();
  try {
    await require('./events');
    logger.log('info', 'server started');
  } catch (error) {
    logger.log('error', error);
  }
};

client.connect(connect);
