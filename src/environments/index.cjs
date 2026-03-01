const path = require('node:path');
const {
  NODE_ENV,
  SERVER_HOST,
  APP_URL,
  TELEGRAM_TOKEN,
  TELEGRAM_DOMAIN,
  TELEGRAM_MINI_APP,
} = process.env;

const IS_DEV = String(NODE_ENV)?.toLowerCase()?.startsWith('dev');

module.exports = {
  DATABASE: {
    /**
     * @returns {string}
     */
    root() {
      return path.join(__dirname, '../../');
    },
    /**
     * @returns {string}
     */
    get USERS() {
      return path.join(this.root(), 'database', 'users.sqlite');
    },
  },
  AGENT: {
    /**
     * @returns {string}
     */
    get MODEL() {
      return 'yandexgpt-lite';
    },
    /**
     * @returns {string}
     */
    get MEMORY() {
      if (IS_DEV) {
        return ':memory:';
      }
      return path.resolve('./database/agent.sqlite');
    },
  },
  SERVER: {
    /**
     * @returns {boolean}
     */
    get IS_DEV() {
      return IS_DEV;
    },
    /**
     * @returns {string}
     */
    get APP_URL() {
      return APP_URL;
    },
    /**
     * @returns {string}
     */
    get HOST() {
      return SERVER_HOST;
    },
  },
  TELEGRAM: {
    get TOKEN() {
      return TELEGRAM_TOKEN;
    },
    get DOMAIN() {
      return TELEGRAM_DOMAIN;
    },
    get BOT_LINK() {
      if (IS_DEV) {
        return 'https://t.me/secretary_dev_bot/Contracts';
      }
      return 'https://t.me/gotois_bot/App';
    },
    get APP_URL() {
      return APP_URL;
    },
  },
};
