const fs = require('fs');
const dotenv = require('dotenv');
const validator = require('validator');
const herokuAPP = require('../../app.json');

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
  GOOGLE_KNOWLEDGE_GRAPH,

  TELEGRAM_TOKEN,

  SENTRY_DSN,

  PORT,

  DIALOGFLOW_CREDENTIALS,
  DIALOGFLOW_CREDENTIALS_SEARCH,

  NALOGRU_EMAIL,
  NALOGRU_NAME,
  NALOGRU_PHONE,
  NALOGRU_KP_PASSWORD,

  SENDGRID_API_KEY,
  SENDGRID_API_KEY_DEV,

  OPEN_WEATHER_KEY,

  YA_DICTIONARY,

  FOURSQUARE_CLIEND_ID,
  FOURSQUARE_CLIENT_SECRET,

  YA_PDD_TOKEN,
  YA_OAUTH_ID,
  YA_OAUTH_PASSWORD,
  YA_OAUTH_CALLBACK,

  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,

  SECURE_KEY,
  REDIS_URL,

  JENA_URL,
  JENA_DATABASE_NAME,

  MEMCACHIER_SERVERS,
  MEMCACHIER_USERNAME,
  MEMCACHIER_PASSWORD,

  ASSISTANTS,
} = process.env;

const ENV = {
  MEMCACHIER: {
    MEMCACHIER_SERVERS,
    MEMCACHIER_USERNAME,
    MEMCACHIER_PASSWORD,
  },
  SECURE_KEY, // Heroku securekey
  JENA: {
    URL: JENA_URL,
    DATABASE: {
      NAME: JENA_DATABASE_NAME,
    },
  },
  NGROK: {
    TOKEN: NGROK,
    URL: NGROK_URL,
  },
  REDIS: {
    URL: REDIS_URL,
  },
  DATABASE: {
    host: PGHOST,
    name: PGDATABASE,
    user: PGUSER,
    port: PGPORT,
    password: PGPASSWORD,
    /**
     * @see path отличается одним символом @
     * @returns {string}
     */
    get POSTGRES_CONNECTION_STRING() {
      const { user, password, host, port, name } = ENV.DATABASE;
      if (ENV.IS_PRODUCTION) {
        return `postgres://${user}:${password}.${host}:${port}/${name}`;
      } else if (ENV.IS_CI) {
        return `postgres://${user}@${host}:${port}/${name}`;
      } else {
        return `postgres://${user}:${password}@${host}:${port}/${name}`;
      }
    },
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
    YA_DICTIONARY,
  },
  TELEGRAM: {
    get TOKEN() {
      return TELEGRAM_TOKEN;
    },
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
  NALOGRU: {
    NALOGRU_EMAIL,
    NALOGRU_NAME,
    NALOGRU_PHONE,
    NALOGRU_KP_PASSWORD,
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
  MARKETPLACE: {
    get ASSISTANTS() {
      if (ASSISTANTS) {
        if (validator.isJSON(ASSISTANTS)) {
          return JSON.parse(ASSISTANTS);
        }
      } else {
        const buf = fs.readFileSync('assistants.env');
        const config = dotenv.parse(buf);
        return JSON.parse(config.ASSISTANTS);
      }
      throw new Error('Unknown ASSISTANTS env');
    },
  },
  OPEN_WEATHER: {
    OPEN_WEATHER_KEY,
  },
  GOOGLE: {
    GOOGLE_MAPS_GEOCODING_API,
    GOOGLE_KNOWLEDGE_GRAPH,
    CLOUD: {
      // Bucket where the file resides
      bucketName: 'prostodiary.appspot.com',
    },
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
    get DIALOGFLOW_CREDENTIALS_SEARCH() {
      return JSON.parse(DIALOGFLOW_CREDENTIALS_SEARCH);
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
  FOURSQUARE: {
    get CLIEND_ID() {
      return FOURSQUARE_CLIEND_ID;
    },
    get CLIENT_SECRET() {
      return FOURSQUARE_CLIENT_SECRET;
    },
  },
  /**
   * Heroku production
   *
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

const importantVariables = new Set([
  'REDIS',
  'DATABASE',
  'SERVER',
  'GOOGLE',
  'DIALOGFLOW',
]);
if (!ENV.IS_CI) {
  importantVariables.add('MARKETPLACE');
  importantVariables.add('TELEGRAM');
}

Object.entries(ENV).forEach((value) => {
  const [name, key] = value;

  if (importantVariables.has(name)) {
    for (const item of Object.keys(key)) {
      if (!key[item]) {
        throw new Error(`You should provide following: ${name}.${item}`);
      }
    }
  }
});

module.exports = ENV;
