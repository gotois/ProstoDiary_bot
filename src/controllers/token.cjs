const { v4: uuidv4 } = require('uuid');
const requestJsonRpc2 = require('request-json-rpc2').default;
const { authorizationCodeGrant, fetchUserInfo } = require('openid-client');
const { setJWT } = require('../models/users.cjs');
const getClient = require('../oidc-client.cjs');
const { bot } = require('./bot.cjs');
const { SERVER } = require('../environments/index.cjs');
const { pdfToPng } = require('pdf-to-png-converter');
const { sendPrepareAction, UPLOAD_DOCUMENT } = require('../libs/tg-messages.cjs');

module.exports = async (request, response) => {
  if (request.query?.error) {
    return response.status(400).send(`
    <h1>${request.query.error_description}</h1>
    `);
  }

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

    const waitingMessage = await bot.sendMessage(userInfo.tid, '⏳ Идет авторизация...', {
      reply_markup: {
        remove_keyboard: true,
      },
    });

    const { result } = await requestJsonRpc2({
      url: SERVER.RPC,
      body: {
        jsonrpc: '2.0',
        id: uuidv4(),
        method: 'hello',
        params: {},
      },
      headers: {
        Timezone: userInfo.time_zone,
        Authorization: tokens.access_token,
      },
    });

    await sendPrepareAction(bot, userInfo.tid, UPLOAD_DOCUMENT);
    const [url] = result.credentialSubject.object.attachment;
    const responseDocument = await fetch(url);
    const fileBuffer = await responseDocument.arrayBuffer();
    const pngPages = await pdfToPng(Buffer.from(fileBuffer));
    const photos = pngPages.map((page) => {
      return {
        type: 'photo',
        media: page.content,
        width: page.width,
        height: page.height,
        caption:
          page.pageNumber === 1
            ? 'Вы зарегистрированы!\n' +
              'Продолжая использование сервиса Вы принимаете условия пользовательского Лицензионного соглашения /licence.'
            : undefined,
      };
    });
    await bot.sendMediaGroup(userInfo.tid, photos, {
      disable_notification: true,
      message_effect_id: '5046509860389126442', // 🎉
      protect_content: true,
      reply_markup: {
        keyboard: [],
      },
    });
    await bot.deleteMessage(userInfo.tid, waitingMessage.message_id);

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
<img src="${url}" alt="">
</body>
</html>
  `.trim(),
    );
  } catch (error) {
    response.send(error.stack);
  }
};
