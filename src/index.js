const client = require('./database/database.client');
const logger = require('./services/logger.service');
const { IS_PRODUCTION } = require('./env');

// start Telegram Bot
(async function telegramBot() {
  /**
   * @returns {Promise<any>}
   */
  const checkAuth = () => {
    return new Promise(async (resolve, reject) => {
      // noinspection MagicNumberJS
      const DELAY = IS_PRODUCTION ? 10000 : 2500;
      const timer = setTimeout(() => {
        return reject(new Error('Network unavailable'));
      }, DELAY);
      try {
        const me = await require('./bot').getMe();
        clearTimeout(timer);
        resolve(me);
      } catch (error) {
        logger.log('info', error);
      }
    });
  };
  try {
    if (!client._connected) {
      await client.connect();
    }
    await checkAuth();
  } catch (error) {
    logger.log({ level: 'error', message: error.toString() });
    setTimeout(
      async () => {
        logger.log({ level: 'info', message: 'try reconnecting…' });
        await telegramBot();
      },
      IS_PRODUCTION ? 10000 : 500,
    );
    return;
  }
  await require('./events');
  logger.log('info', 'bot started');
})();
