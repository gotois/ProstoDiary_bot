const { NODE_ENV, SERVER_APP, SERVER_HOST, TELEGRAM_TOKEN, TELEGRAM_DOMAIN, TELEGRAM_MINI_APP } = process.env;

module.exports = {
  get IS_DEV() {
    return String(NODE_ENV)?.toLowerCase()?.startsWith('dev');
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
