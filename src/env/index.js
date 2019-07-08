const {
  NODE_ENV,

  DB_HOST,
  DB_NAME,
  DB_USER_NAME,
  DB_PORT,
  DB_PASSWORD,
  SALT_PASSWORD,

  CORALOGIX_WINSTON_PRIVATE_KEY,
  CORALOGIX_WINSTON_APPLICATION_NAME,

  GOOGLE_APPLICATION_CREDENTIALS,
  GOOGLE_MAPS_GEOCODING_API,

  TELEGRAM_TOKEN,

  PORT,
  SERVER_NAME,

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
} = process.env;

const ENV = {
  DATABASE: {
    databaseHost: DB_HOST,
    databaseName: DB_NAME,
    databaseUser: DB_USER_NAME,
    databasePort: DB_PORT,
    password: DB_PASSWORD,
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
    get WEB_HOOK_URL() {
      if (!SERVER_NAME) {
        return '0.0.0.0:3000';
      }
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
    PLOTLY_LOGIN,
    PLOTLY_TOKEN,
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
      return JSON.parse(GOOGLE_APPLICATION_CREDENTIALS);
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
      return JSON.parse(DIALOGFLOW_CREDENTIALS);
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
  get IS_PRODUCTION() {
    return String(NODE_ENV) === 'production';
  },
  get IS_CI() {
    return String(NODE_ENV) === 'TRAVIS_CI';
  },
  get IS_DEV() {
    return String(NODE_ENV) === 'development';
  },
};

module.exports = ENV;
