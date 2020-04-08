#!/usr/bin/env node
/* eslint-disable */
require('dotenv').config();
const inquirer = require('inquirer');

const questions = [
  {
    type: 'input',
    name: 'TELEGRAM_TOKEN',
    message: 'telegram token',
  },
  // ...
  {
    type: 'confirm',
    name: 'ok',
    message: 'Is this ok?',
    default: true,
  },
];

(async function main() {
  const {
    // telegram
    TELEGRAM_TOKEN,

    // PGSQL
    PGPASSWORD,
    PGPORT,
    PGHOST,
    PGDATABASE,
    PGUSER,

    // Redis
    REDIS_URL,

    // Coralogix
    CORALOGIX_WINSTON_PRIVATE_KEY,
    CORALOGIX_WINSTON_APPLICATION_NAME,

    // Google
    GOOGLE_MAPS_GEOCODING_API,
    GOOGLE_APPLICATION_CREDENTIALS,
    GOOGLE_KNOWLEDGE_GRAPH,

    // Dialogflow
    DIALOGFLOW_CREDENTIALS,
    DIALOGFLOW_CREDENTIALS_SEARCH,

    // nalog.ru
    NALOGRU_EMAIL,
    NALOGRU_NAME,
    NALOGRU_PHONE,
    NALOGRU_KP_PASSWORD,

    // SENDGRID
    SENDGRID_API_KEY,
    SENDGRID_API_KEY_DEV,

    // OPEN WHEATHER
    OPEN_WEATHER_KEY,

    // foursquare
    FOURSQUARE_CLIEND_ID,
    FOURSQUARE_CLIENT_SECRET,
    FOURSQUARE_PUSH_SECRET,
    FOURSQUARE_REDIRECT_URI,
    FOURSQUARE_ACCESS_TOKEN,

    // NGROK
    NGROK,

    // YANDEX
    YA_DICTIONARY,
    YA_PDD_TOKEN, // getting from https://pddimp.yandex.ru/api2/admin/get_token_result
    YA_OAUTH_ID,
    YA_OAUTH_PASSWORD,
    YA_OAUTH_CALLBACK,

    // facebook
    FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET,

    // sentry
    SENTRY_DSN,

    ok,
  } = await inquirer.prompt(questions);
  if (!ok) {
    return;
  }
  // todo записывать в .env
})();
