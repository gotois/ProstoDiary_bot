const path = require('node:path');
const { NODE_ENV, SERVER_APP, SERVER_HOST, TELEGRAM_TOKEN, TELEGRAM_DOMAIN, TELEGRAM_MINI_APP } = process.env;

module.exports = {
  /**
   * @returns {boolean}
   */
  get IS_DEV() {
    return String(NODE_ENV)?.toLowerCase()?.startsWith('dev');
  },
  /**
   * @returns {string}
   */
  get DATABASE_PATH() {
    const rootDirectory = path.join(__dirname, '../../');
    return path.join(rootDirectory, 'database', 'database.sqlite');
  },
  get SERVER_APP_URL() {
    return SERVER_APP;
  },
  get SERVER_HOST() {
    return SERVER_HOST;
  },
  get TELEGRAM_TOKEN() {
    return TELEGRAM_TOKEN;
  },
  get TELEGRAM_DOMAIN() {
    return TELEGRAM_DOMAIN;
  },
  get TELEGRAM_MINI_APP_URL() {
    return TELEGRAM_MINI_APP;
  },
};
