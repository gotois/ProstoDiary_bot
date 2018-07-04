const client = require('./database/database.client');
const logger = require('./services/logger.service');
/**
 * @returns {Promise<any>}
 */
const checkAuth = () => new Promise(async (resolve, reject) => {
  // noinspection MagicNumberJS
  const DELAY = 5000;
  const timer = setTimeout(() => reject(new Error('Network unavailable')), DELAY);
  const me = await require('./config').getMe();
  clearTimeout(timer);
  resolve(me);
});
/**
 * @param error {Object|undefined}
 */
const connect = async error => {
  if (error) {
    logger.log({level: 'error', message: 'Connect error' + error});
    throw new Error('Connect error');
  }
  try {
    await checkAuth();
  } catch (error) {
    logger.log('error', error.toString());
    throw error;
  }
  try {
    await require('./events');
    logger.log('info', 'server started');
  } catch (error) {
    logger.log('error', error.toString());
  }
};

client.connect(connect);
