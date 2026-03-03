const { authorizationCodeGrant, fetchUserInfo } = require('openid-client');
const { setJWT } = require('../models/users.cjs');
const getClient = require('../oidc-client.cjs');

module.exports = async (request, response) => {
  const client = await getClient();

  if (!request.session.code_verifier || !request.session.state) {
    return response.status(400).send('Missing PKCE verifier or state in session');
  }

  const callbackUrl = new URL(request.url, `https://${request.headers.host}`);

  try {
    const tokens = await authorizationCodeGrant(client, callbackUrl, {
      pkceCodeVerifier: request.session.code_verifier,
      expectedState: request.session.state,
    });

    const userInfo = await fetchUserInfo(client, tokens.access_token, tokens.claims().sub);
    setJWT(userInfo.tid, tokens);

    response.send(
      `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Success</title>
<script>
function appendTelegramWebAppScript() {
  return new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://telegram.org/js/telegram-web-app.js';
  script.onload = () => {
    resolve();
  };
  script.onerror = () => {
    reject();
  };
  document.head.appendChild(script);
  });
};
(async function main() {
  await appendTelegramWebAppScript();
  const timeZone = {
    type: 'tz',
    data: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  Telegram.WebApp.sendData(JSON.stringify(timeZone));
}());
    </script>
</head>
<body>
<h1>Authentication successful!</h1>
</body>
</html>
  `.trim(),
    );
  } catch (error) {
    response.send(error.stack);
  }
};
