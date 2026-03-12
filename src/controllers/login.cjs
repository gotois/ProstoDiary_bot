const {
  buildAuthorizationUrl,
  randomPKCECodeVerifier,
  calculatePKCECodeChallenge,
  randomState,
} = require('openid-client');
const { OIDC } = require('../environments/index.cjs');
const getClient = require('../oidc-client.cjs');

module.exports = async (request, response) => {
  const client = await getClient();
  const codeVerifier = randomPKCECodeVerifier();
  const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);
  const state = randomState();

  request.session.code_verifier = codeVerifier;
  request.session.state = state;
  await request.session.save();

  const authorizationUrl = buildAuthorizationUrl(client, {
    scope: 'openid profile',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    redirect_uri: OIDC.CLIENT_REDIRECT,
  });

  response.send(`
    <html lang="ru">
      <head>
        <title>Перенаправление...</title>
        <script>
          sessionStorage.setItem('__tma_hash', window.location.hash);
        </script>
        <meta http-equiv="refresh" content="0; url=${authorizationUrl.toString()}">
      </head>
      <body>
        Перенаправление...
      </body>
    </html>
  `);
};
