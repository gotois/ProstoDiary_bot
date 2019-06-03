const bot = require('./bot');
const dbClient = require('./database/index');
const logger = require('./services/logger.service');
const { IS_PRODUCTION } = require('./env');
/**
 * @returns {Promise<any>}
 */
const initBot = () => {
  return new Promise(async (resolve, reject) => {
    // noinspection MagicNumberJS
    const DELAY = IS_PRODUCTION ? 10000 : 2500;
    const timer = setTimeout(() => {
      return reject(new Error('Network unavailable'));
    }, DELAY);
    try {
      const me = await bot.getMe();
      clearTimeout(timer);
      return resolve(me);
    } catch (error) {
      logger.log('info', error);
    }
  });
};
/**
 * connect DB
 *
 * @returns {Promise<undefined>}
 */
const dbConnect = async () => {
  if (!dbClient.client._connected) {
    await dbClient.client.connect();
  }
};
/**
 * Start Telegram Bot
 *
 * @param {number} _reconnectCount - reconnectCount
 * @returns {Promise<object>}
 */
const startTelegramBot = async (_reconnectCount = 0) => {
  if (_reconnectCount > 20) {
    throw new Error('Connect error');
  }
  try {
    const botInfo = await initBot();
    return botInfo;
  } catch (error) {
    setTimeout(
      async () => {
        logger.log('info', `try ${_reconnectCount} reconnecting…`);
        await startTelegramBot(++_reconnectCount);
      },
      IS_PRODUCTION ? 10000 : 500,
    );
  }
};

(async function main() {
  await dbConnect();
  const botInfo = await startTelegramBot(1);
  await require('./events');
  if (IS_PRODUCTION) {
    logger.log('info', `production bot:${botInfo.first_name} started`);
  } else {
    logger.log('info', 'dev bot started');
  }
})();
