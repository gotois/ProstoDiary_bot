const {
  NODE_ENV,
  HOST, // TODO: rename -> DB_HOST
  DATABASE, // TODO: rename -> DB_NAME
  DB_USER, // TODO: rename -> DB_USER_NAME
  DBPORT, // TODO: rename -> DB_PORT
  PASSWORD, // TODO: rename -> DB_PASSWORD
  CORALOGIX_WINSTON_PRIVATE_KEY,
  CORALOGIX_WINSTON_APPLICATION_NAME,
  GOOGLE_APPLICATION_CREDENTIALS,
  TOKEN, // TODO: rename -> TELEGRAM_TOKEN
  PORT,
  HEROKU_NAME, // TODO: rename -> SERVER_NAME
  DIALOGFLOW_CREDENTIALS,
  DIALOGFLOW_PROJECT_ID,
  GOOGLE_MAPS_GEOCODING_API,
  PLOTLY_LOGIN,
  PLOTLY_TOKEN,
  SALT_PASSWORD,
  NALOGRU_EMAIL,
  NALOGRU_NAME,
  NALOGRU_PHONE,
  NALOGRU_KP_PASSWORD,
  FAT_SECRET_APPNAME,
  FAT_SECRET_API_ACCESS_KEY,
  FAT_SECRET_API_SHARED_SECRET,
  SENDGRID_API_KEY,
  OPEN_WEATHER_KEY,
} = process.env;

module.exports = {
  DATABASE: {
    dbHost: HOST,
    dbName: DATABASE,
    dbUser: DB_USER,
    dbPort: DBPORT,
    password: PASSWORD,
    get passwordSalt() {
      return SALT_PASSWORD;
    },
  },
  CORALOGIX: {
    CORALOGIX_WINSTON_PRIVATE_KEY,
    CORALOGIX_WINSTON_APPLICATION_NAME,
  },
  TELEGRAM: {
    TOKEN,
    get WEB_HOOK_URL() {
      if (!HEROKU_NAME || !TOKEN) {
        throw new Error('Env error: HEROKU_NAME or TOKEN not found');
      }
      return `https://${HEROKU_NAME}.herokuapp.com/bot${TOKEN}`;
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
    get DIALOGFLOW_CREDENTIALS() {
      if (!DIALOGFLOW_CREDENTIALS) {
        throw new Error('Env error: DIALOGFLOW_CREDENTIALS is not initialized');
      }
      return JSON.parse(DIALOGFLOW_CREDENTIALS);
    },
  },
  get IS_PRODUCTION() {
    return String(NODE_ENV) === 'production';
  },
  get IS_CI() {
    return String(NODE_ENV) === 'TRAVIS_CI';
  },
  get IS_DEV() {
    return !NODE_ENV || String(NODE_ENV) === 'development';
  },
};
