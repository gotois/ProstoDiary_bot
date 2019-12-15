const validator = require('validator');
const { version } = require('../../package');
const herokuAPP = require('../../app');

const {
  NODE_ENV,
  HOST,

  NGROK,
  NGROK_URL,
  PGHOST,
  PGDATABASE,
  PGUSER,
  PGPORT,
  PGPASSWORD,

  CORALOGIX_WINSTON_PRIVATE_KEY,
  CORALOGIX_WINSTON_APPLICATION_NAME,

  GOOGLE_APPLICATION_CREDENTIALS,
  GOOGLE_MAPS_GEOCODING_API,

  TELEGRAM_TOKEN,

  SENTRY_DSN,

  PORT,

  DIALOGFLOW_CREDENTIALS,
  DIALOGFLOW_PROJECT_ID,

  PLOTLY_LOGIN,
  PLOTLY_TOKEN,

  NALOGRU_EMAIL,
  NALOGRU_NAME,
  NALOGRU_PHONE,
  NALOGRU_KP_PASSWORD,

  FAT_SECRET_APPNAME,
  FAT_SECRET_API_ACCESS_KEY,
  FAT_SECRET_API_SHARED_SECRET,

  SENDGRID_API_KEY,
  SENDGRID_API_KEY_DEV,

  OPEN_WEATHER_KEY,

  WOLFRAM_ALPHA_APP_NAME,
  WOLFRAM_ALPHA_APPID,
  WOLRFRAM_ALPHA_USAGE_TYPE,

  TODOIST_CLIENT_ID,
  TODOIST_CLIENT_SECRET,
  TODOIST_ACCESS_TOKEN,

  FOURSQUARE_CLIEND_ID,
  FOURSQUARE_CLIENT_SECRET,

  YA_PDD_TOKEN,
  YA_OAUTH_ID,
  YA_OAUTH_PASSWORD,
  YA_OAUTH_CALLBACK,

  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
} = process.env;

const ENV = {
  NGROK: {
    TOKEN: NGROK,
    URL: NGROK_URL,
  },
  DATABASE: {
    host: PGHOST,
    name: PGDATABASE,
    user: PGUSER,
    port: PGPORT,
    password: PGPASSWORD,
  },
  CORALOGIX: {
    CORALOGIX_WINSTON_PRIVATE_KEY,
    CORALOGIX_WINSTON_APPLICATION_NAME,
  },
  SENTRY: {
    DSN: SENTRY_DSN,
  },
  FACEBOOK: {
    FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET,
  },
  YANDEX: {
    YA_PDD_TOKEN,
    YA_OAUTH_ID,
    YA_OAUTH_PASSWORD,
    YA_OAUTH_CALLBACK,
  },
  TELEGRAM: {
    TOKEN: TELEGRAM_TOKEN,
    get API_URL() {
      if (ENV.IS_AVA_OR_CI) {
        const { HOST, PORT } = ENV.SERVER;
        return `http://${HOST}:${PORT}`;
      }
      return 'https://api.telegram.org';
    },
  },
  SERVER: {
    get PORT() {
      if (PORT && validator.isPort(PORT)) {
        return PORT;
      } else if (!ENV.IS_PRODUCTION) {
        return 9000;
      }
      throw new Error('Unknown Port');
    },
    get HEROKUAPP() {
      return `https://${herokuAPP.name}.herokuapp.com`;
    },
    get HOST() {
      if (!TELEGRAM_TOKEN) {
        throw new Error('TELEGRAM_TOKEN not found');
      } else if (ENV.NGROK.URL) {
        return ENV.NGROK.URL;
      } else if (ENV.IS_PRODUCTION) {
        return ENV.SERVER.HEROKUAPP;
      } else if (HOST) {
        return HOST;
      }
      return 'localhost';
    },
  },
  PLOTLY: {
    get LOGIN() {
      return PLOTLY_LOGIN;
    },
    get TOKEN() {
      return PLOTLY_TOKEN;
    },
  },
  NALOGRU: {
    NALOGRU_EMAIL,
    NALOGRU_NAME,
    NALOGRU_PHONE,
    NALOGRU_KP_PASSWORD,
  },
  FAT_SECRET: {
    FAT_SECRET_APPNAME,
    FAT_SECRET_API_ACCESS_KEY,
    FAT_SECRET_API_SHARED_SECRET,
  },
  SENDGRID: {
    get API_KEY() {
      if (!SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY is not initialized');
      }
      return SENDGRID_API_KEY;
    },
    get API_KEY_DEV() {
      if (!SENDGRID_API_KEY_DEV) {
        throw new Error('SENDGRID_API_KEY_DEV is not initialized');
      }
      return SENDGRID_API_KEY_DEV;
    },
  },
  OPEN_WEATHER: {
    OPEN_WEATHER_KEY,
  },
  GOOGLE: {
    GOOGLE_MAPS_GEOCODING_API,
    get CREDENTIALS() {
      if (!GOOGLE_APPLICATION_CREDENTIALS) {
        throw new Error(
          'Env error: GOOGLE_APPLICATION_CREDENTIALS is not initialized',
        );
      }
      if (validator.isJSON(GOOGLE_APPLICATION_CREDENTIALS)) {
        return JSON.parse(GOOGLE_APPLICATION_CREDENTIALS);
      }
      return GOOGLE_APPLICATION_CREDENTIALS;
    },
  },
  DIALOGFLOW: {
    DIALOGFLOW_PROJECT_ID,
    get sessionId() {
      return 'prostodiary-session-' + version;
    },
    get CREDENTIALS() {
      if (!DIALOGFLOW_CREDENTIALS) {
        throw new Error('Env error: DIALOGFLOW_CREDENTIALS is not initialized');
      }
      if (validator.isJSON(DIALOGFLOW_CREDENTIALS)) {
        return JSON.parse(DIALOGFLOW_CREDENTIALS);
      }
      return DIALOGFLOW_CREDENTIALS;
    },
  },
  WOLFRAM_ALPHA: {
    get APP_NAME() {
      return WOLFRAM_ALPHA_APP_NAME;
    },
    get APP_ID() {
      return WOLFRAM_ALPHA_APPID || 'DEMO';
    },
    get USAGE_TYPE() {
      return WOLRFRAM_ALPHA_USAGE_TYPE;
    },
  },
  TODOIST: {
    get CLIENT_ID() {
      return TODOIST_CLIENT_ID;
    },
    get CLIENT_SECRET() {
      return TODOIST_CLIENT_SECRET;
    },
    get ACCESS_TOKEN() {
      return TODOIST_ACCESS_TOKEN;
    },
  },
  FOURSQUARE: {
    get CLIEND_ID() {
      return FOURSQUARE_CLIEND_ID;
    },
    get CLIENT_SECRET() {
      return FOURSQUARE_CLIENT_SECRET;
    },
  },
  /**
   * @see path отличается одним символом @
   * @returns {string}
   */
  get POSTGRES_CONNECTION_STRING() {
    const { user, password, host, port, name } = ENV.DATABASE;
    // todo предусмотреть demo режим
    if (ENV.IS_PRODUCTION) {
      return `postgres://${user}:${password}.${host}:${port}/${name}`;
    } else if (ENV.IS_CI) {
      return `postgres://${user}@${host}:${port}/${name}`;
    } else {
      return `postgres://${user}:${password}@${host}:${port}/${name}`;
    }
  },
  /**
   * @returns {boolean}
   */
  get IS_PRODUCTION() {
    return String(NODE_ENV).toLowerCase() === 'production';
  },
  /**
   * @returns {boolean}
   */
  get IS_CI() {
    return String(NODE_ENV).toLowerCase() === 'travis_ci';
  },
  /**
   * @returns {boolean}
   */
  get IS_FAST_TEST() {
    return Boolean(process.env.FAST_TEST);
  },
  /**
   * @returns {boolean}
   */
  get IS_AVA() {
    return String(NODE_ENV).toLowerCase() === 'test';
  },
  /**
   * @returns {boolean}
   */
  get IS_AVA_OR_CI() {
    return ENV.IS_CI || ENV.IS_AVA;
  },
  /**
   * @returns {boolean}
   */
  get IS_CRON() {
    return String(NODE_ENV).toLowerCase() === 'cron';
  },
};

module.exports = ENV;
