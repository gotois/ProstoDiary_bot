const { discovery } = require('openid-client');
const { SERVER, OIDC } = require('./environments/index.cjs');

let client;

module.exports = async () => {
  if (client) {
    return client;
  }
  client = await discovery(new URL(SERVER.HOST), OIDC.CLIENT_ID, {
    client_secret: OIDC.CLIENT_SECRET,
    redirect_uris: [OIDC.CLIENT_REDIRECT],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_basic',
  });
  return client;
};
