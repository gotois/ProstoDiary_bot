const {
  buildAuthorizationUrl,
  randomPKCECodeVerifier,
  calculatePKCECodeChallenge,
  randomState,
} = require('openid-client');
const { OIDC } = require('../environments/index.cjs');
const getClient = require('../oidc-client.cjs');

/**
 * @returns {object}
 */
async function getAuthorization() {
  const client = await getClient();
  const codeVerifier = randomPKCECodeVerifier();
  const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);
  const state = randomState();

  return {
    client,
    codeVerifier,
    parameters: {
      scope: 'openid profile',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
      redirect_uri: OIDC.CLIENT_REDIRECT,
    },
  };
}

module.exports = async (request, response) => {
  try {
    const { client, codeVerifier, parameters } = await getAuthorization();
    request.session.code_verifier = codeVerifier;
    request.session.state = parameters.state;
    await request.session.save();

    const authorizationUrl = buildAuthorizationUrl(client, parameters);
    response.send(`
    <html lang="ru">
      <head>
        <title>Перенаправление...</title>
        <script>sessionStorage.setItem('__tma_hash', window.location.hash);</script>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <script>
          window.Telegram.WebApp.ready();
          const initData = window.Telegram.WebApp.initData;
          if (initData) {
            fetch('/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData }),
            })
              .then((r) => r.json())
              .then(({ url }) => window.location.replace(url));
          } else {
            window.location.replace('${authorizationUrl.toString()}');
          }
        </script>
      </head>
      <body>Перенаправление...</body>
    </html>
  `);
  } catch (error) {
    console.error(error);
    response.status(400).send('Произошла ошибка авторизации клиента');
  }
};
