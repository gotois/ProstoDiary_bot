const validator = require('validator');
const { get } = require('../services/request.service');

const {
  NODE_ENV,

  PGHOST,
  PGDATABASE,
  PGUSER,
  PGPORT,
  PGPASSWORD,

  SALT_PASSWORD,

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

  PERSON,

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
    databaseHost: PGHOST,
    databaseName: PGDATABASE,
    databaseUser: PGUSER,
    databasePort: PGPORT,
    password: PGPASSWORD,
    // todo: переместить отсюда
    get passwordSalt() {
      return SALT_PASSWORD;
    },
  },
  CORALOGIX: {
    CORALOGIX_WINSTON_PRIVATE_KEY,
    CORALOGIX_WINSTON_APPLICATION_NAME,
  },
  TELEGRAM: {
    TOKEN: TELEGRAM_TOKEN,
    get API_URL() {
      if (ENV.IS_AVA || ENV.IS_CI) {
        return `http://${ENV.TELEGRAM_TEST_SERVER.HOST}:${ENV.TELEGRAM_TEST_SERVER.PORT}`;
      }
      return 'https://api.telegram.org';
    },
    get WEB_HOOK_URL() {
      if (!TELEGRAM_TOKEN) {
        throw new Error('TELEGRAM_TOKEN not found');
      }
      if (this.IS_PRODUCTION) {
        return `https://${SERVER_NAME}.herokuapp.com/bot${TELEGRAM_TOKEN}`;
      }
      return SERVER_NAME;
    },
  },
  SERVER: {
    PORT,
  },
  /**
   * @returns {Promise<jsonld>|Error}
   */
  get PERSON() {
    if (typeof PERSON === 'object') {
      return Promise.resolve(PERSON);
    } else if (typeof PERSON === 'string') {
      if (validator.isURL(PERSON)) {
        return (async () => {
          const personData = await get(PERSON);
          return JSON.parse(personData.toString('utf8'));
        })();
      } else if (validator.isJSON(PERSON)) {
        return Promise.resolve(JSON.parse(PERSON));
      }
    }
    throw new Error('Env error: PERSON typeof');
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
    SENDGRID_API_KEY,
  },
  OPEN_WEATHER: {
    OPEN_WEATHER_KEY,
  },
  GOOGLE: {
    GOOGLE_MAPS_GEOCODING_API,
    get GOOGLE_CREDENTIALS_PARSED() {
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
      // TODO: почему такое значение?
      return 'quickstart-session-id';
    },
    get DIALOGFLOW_CREDENTIALS() {
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
    get PORT() {
      if (!validator.isPort(TELEGRAM_TEST_SERVER_PORT)) {
        throw new Error('ENV: TELEGRAM_TEST_SERVER_PORT');
      }
      return Number(TELEGRAM_TEST_SERVER_PORT);
    },
  },
  get IS_PRODUCTION() {
    return String(NODE_ENV) === 'production';
  },
  get IS_CI() {
    return String(NODE_ENV) === 'TRAVIS_CI';
  },
  get IS_AVA() {
    return String(process.env.NODE_ENV) === 'test';
  },
};

module.exports = ENV;
