const client = require('./database/database.client');
const logger = require('./services/logger.service');
const {IS_PRODUCTION} = require('./env');
/**
 * @returns {Promise<any>}
 */
const checkAuth = () => new Promise(async (resolve, reject) => {
  // noinspection MagicNumberJS
  const DELAY = IS_PRODUCTION ? 10000 : 1000;
  const timer = setTimeout(() => reject(new Error('Network unavailable')), DELAY);
  const me = await require('./config').getMe();
  clearTimeout(timer);
  resolve(me);
});

(async function main() {
  try {
    if (!client._connected) {
      await client.connect();
    }
    await checkAuth();
    await require('./events');
    logger.log('info', 'bot started');
  } catch (error) {
    logger.log({level: 'error', message: error.toString()});
    setTimeout(async () => {
      logger.log({level: 'info', message: 'try reconnecting...'});
      await main();
    }, 10000);
  }
})();
