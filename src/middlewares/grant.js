const Grant = require('grant-express');
const { IS_AVA_OR_CI, SERVER, YANDEX, FACEBOOK } = require('../environment');

const grantConfig = {
  defaults: {
    protocol: IS_AVA_OR_CI ? 'http' : 'https',
    host: SERVER.HOST,
    callback: '/oauth',
    transport: 'session',
    state: true,
  },
  facebook: {
    key: FACEBOOK.FACEBOOK_APP_ID,
    secret: FACEBOOK.FACEBOOK_APP_SECRET,
  },
  yandex: {
    key: YANDEX.YA_OAUTH_ID,
    secret: YANDEX.YA_OAUTH_PASSWORD,
    redirect_uri: process.env.NGROK_URL + '/connect/yandex/callback',
    nonce: true,
  },
};

module.exports = new Grant(grantConfig);
