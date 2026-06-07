import path from 'node:path';

const {
  NODE_ENV,
  HOST,
  SECRETARY_HOST,
  CLIENT_ID,
  CLIENT_SECRET,
  APP_URL,
  VOSK_RECOGNIZE_URL,
  TELEGRAM_BOT_NAME,
  TELEGRAM_TOKEN,
  TELEGRAM_DOMAIN,
} = process.env;

const IS_DEV = String(NODE_ENV)?.toLowerCase()?.startsWith('dev');

export default {
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
    root() {
      return path.join(import.meta.dirname, '../../');
    },
    get USERS() {
      return path.join(this.root(), 'database', 'users.sqlite');
    },
  },
  AGENT: {
    get MODEL() {
      return 'yandexgpt-lite';
    },
    get MEMORY() {
      if (IS_DEV) {
        return ':memory:';
      }
      return path.resolve('./database/agent.sqlite');
    },
  },
  SERVER: {
    get HOST() {
      return HOST;
    },
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
    get MCP() {
      return SECRETARY_HOST + '/mcp';
    },
    get RPC() {
      return SECRETARY_HOST + '/rpc';
    },
    get HOST() {
      return SECRETARY_HOST;
    },
  },
  TELEGRAM: {
    get TOKEN() {
      return TELEGRAM_TOKEN;
    },
    get DOMAIN() {
      return TELEGRAM_DOMAIN;
    },
    get BOT_NAME() {
      return TELEGRAM_BOT_NAME;
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
  get IS_DEV() {
    return IS_DEV;
  },
};
