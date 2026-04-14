const { discovery } = require('openid-client');
const { SECRETARY, OIDC } = require('./environments/index.cjs');

let client;

module.exports = async () => {
  if (client) {
    return client;
  }
  client = await discovery(new URL(SECRETARY.HOST), OIDC.CLIENT_ID, {
    client_secret: OIDC.CLIENT_SECRET,
    redirect_uris: [OIDC.CLIENT_REDIRECT],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_basic',
  });
  return client;
};
