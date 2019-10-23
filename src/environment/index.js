const validator = require('validator');
const { version } = require('../../package');

const {
  NODE_ENV,

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

  PORT,
  SERVER_NAME,

  TELEGRAM_TEST_SERVER_HOST,
  TELEGRAM_TEST_SERVER_PORT,

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

  OPEN_WEATHER_KEY,

  WOLFRAM_ALPHA_APP_NAME,
  WOLFRAM_ALPHA_APPID,
  WOLRFRAM_ALPHA_USAGE_TYPE,

  TODOIST_CLIENT_ID,
  TODOIST_CLIENT_SECRET,
  TODOIST_ACCESS_TOKEN,

  FOURSQUARE_CLIEND_ID,
  FOURSQUARE_CLIENT_SECRET,

  MAIL_USER,
  MAIL_PASSWORD,
  MAIL_HOST,
  MAIL_PORT,
} = process.env;

const ENV = {
  MAIL: {
    USER: MAIL_USER,
    PASSWORD: MAIL_PASSWORD,
    HOST: MAIL_HOST,
    PORT: MAIL_PORT,
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
  TELEGRAM: {
    TOKEN: TELEGRAM_TOKEN,
    get API_URL() {
      if (ENV.IS_AVA_OR_CI) {
        const { HOST, PORT } = ENV.TELEGRAM_TEST_SERVER;
        return `http://${HOST}:${PORT}`;
      }
      return 'https://api.telegram.org';
    },
    get WEB_HOOK_URL() {
      if (!TELEGRAM_TOKEN) {
        throw new Error('TELEGRAM_TOKEN not found');
      }
      return `https://${SERVER_NAME}.herokuapp.com/bot${TELEGRAM_TOKEN}`;
    },
  },
  SERVER: {
    PORT,
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
        throw new Error('Env error SENDGRID_API_KEY is not initialized');
      }
      return SENDGRID_API_KEY;
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
  TELEGRAM_TEST_SERVER: {
    get HOST() {
      return TELEGRAM_TEST_SERVER_HOST;
    },
    /**
     * @returns {number}
     */
    get PORT() {
      if (!validator.isPort(TELEGRAM_TEST_SERVER_PORT)) {
        throw new Error('ENV: TELEGRAM_TEST_SERVER_PORT');
      }
      return Number(TELEGRAM_TEST_SERVER_PORT);
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
    return String(NODE_ENV) === 'production';
  },
  /**
   * @returns {boolean}
   */
  get IS_CI() {
    return String(NODE_ENV) === 'TRAVIS_CI';
  },
  get IS_FAST_TEST() {
    return Boolean(process.env.FAST_TEST);
  },
  /**
   * @returns {boolean}
   */
  get IS_AVA() {
    return String(NODE_ENV) === 'test';
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
    return String(NODE_ENV) === 'cron';
  },
};

module.exports = ENV;
