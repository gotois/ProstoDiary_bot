const path = require('node:path');
const {
  NODE_ENV,
  HOST,
  SERVER_HOST,
  CLIENT_ID,
  CLIENT_SECRET,
  APP_URL,
  VOSK_RECOGNIZE_URL,
  TELEGRAM_TOKEN,
  TELEGRAM_DOMAIN,
} = process.env;

const IS_DEV = String(NODE_ENV)?.toLowerCase()?.startsWith('dev');

module.exports = {
  OIDC: {
    get CLIENT_ID() {
      return CLIENT_ID;
    },
    get CLIENT_SECRET() {
      return CLIENT_SECRET;
    },
    get CLIENT_REDIRECT() {
      return HOST + '/token';
    },
  },
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
     * @returns {string}
     */
    get HOST() {
      return HOST;
    },
    /**
     * @returns {string}
     */
    get MCP() {
      return HOST + '/mcp';
    },
    /**
     * @returns {string}
     */
    get APP_URL() {
      return APP_URL;
    },
  },
  VOSK: {
    get URL() {
      return VOSK_RECOGNIZE_URL;
    },
  },
  SECRETARY: {
    get RPC() {
      return SERVER_HOST + '/rpc';
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
  /**
   * @returns {boolean}
   */
  get IS_DEV() {
    return IS_DEV;
  },
};
