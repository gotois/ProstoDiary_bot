const path = require('node:path');
const {
  NODE_ENV,
  TELEGRAM_APP_URL,
  SERVER_HOST,
  TELEGRAM_TOKEN,
  TELEGRAM_DOMAIN,
  TELEGRAM_MINI_APP,
} = process.env;

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
    /**
     * @returns {string}
     */
    get CALENDARS() {
      return path.join(this.root(), 'database', 'calendars.sqlite');
    },
  },
  SERVER: {
    /**
     * @returns {boolean}
     */
    get IS_DEV() {
      return String(NODE_ENV)?.toLowerCase()?.startsWith('dev');
    },
    get APP_URL() {
      return TELEGRAM_APP_URL;
    },
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
    get MINI_APP_URL() {
      return TELEGRAM_MINI_APP;
    },
  },
};
