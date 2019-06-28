const bot = require('./bot');
const dbClient = require('./database');
const logger = require('./services/logger.service');
const { projectVersion } = require('./services/version.service');
const { IS_PRODUCTION, IS_DEV, TELEGRAM } = require('./env');
/**
 * @returns {Promise<any>}
 */
const initBot = () => {
  return new Promise((resolve, reject) => {
    // noinspection MagicNumberJS
    const DELAY = IS_PRODUCTION ? 10000 : 2500;
    const timer = setTimeout(() => {
      return reject(new Error('Network unavailable'));
    }, DELAY);
    Promise.all([
      IS_DEV ? bot.deleteWebHook() : bot.setWebHook(TELEGRAM.WEB_HOOK_URL),
      bot.getMe(),
    ]) // eslint-disable-next-line no-unused-vars
      .then(([webhookResult, botInfo]) => {
        clearTimeout(timer);
        resolve(botInfo);
      })
      .catch((error) => {
        logger.log('info', error);
      });
  });
};
/**
 * connect DB
 *
 * @returns {Promise<undefined>}
 */
const databaseConnect = async () => {
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
const startTelegramBot = async (_reconnectCount = 1) => {
  if (_reconnectCount > 20) {
    throw new Error('Connect error');
  }
  try {
    const botInfo = await initBot();
    return botInfo;
  } catch (error) {
    console.error(error);
    setTimeout(
      async () => {
        logger.log('info', `try ${_reconnectCount} reconnecting…`);
        await startTelegramBot(++_reconnectCount);
      },
      IS_PRODUCTION ? 10000 : 500,
    );
  }
};

// TODO: в text добавить версию и ченчлог
const sendUpdatesToUsers = async (text) => {
  const { getAllTelegramUserIds } = require('./database/users.database');
  for (const user of await getAllTelegramUserIds()) {
    await bot.sendMessage(user.telegram_user_id, text);
  }
};

(async function main() {
  await databaseConnect();
  const botInfo = await startTelegramBot();
  require('./events');
  if (IS_PRODUCTION) {
    logger.log('info', `production bot:${botInfo.first_name} started`);
    sendUpdatesToUsers('Bot updated: ' + projectVersion); // TODO: специально не делаем await
  } else {
    logger.log('info', 'dev bot started');
  }
})();
