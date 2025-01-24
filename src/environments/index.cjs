const { NODE_ENV, TELEGRAM_MINI_APP, SERVER_HOST, TELEGRAM_TOKEN, TELEGRAM_DOMAIN } = process.env;

module.exports = {
  get IS_DEV() {
    return String(NODE_ENV)?.toLowerCase()?.startsWith('dev');
  },
  get TELEGRAM_MINI_APP() {
    return TELEGRAM_MINI_APP;
  },
  get TELEGRAM_TOKEN() {
    return TELEGRAM_TOKEN;
  },
  get TELEGRAM_DOMAIN() {
    return TELEGRAM_DOMAIN;
  },
  get TELEGRAM_MINI_APP_URL() {
    // todo вынести в env
    return 'https://t.me/gotois_bot/App';
  },
  get SERVER_HOST() {
    return SERVER_HOST;
  },
};
