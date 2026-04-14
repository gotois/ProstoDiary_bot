const { authorizationCodeGrant, fetchUserInfo } = require('openid-client');
const { setJWT, updateUserTimezone } = require('../models/users.cjs');
const getClient = require('../oidc-client.cjs');
const { bot } = require('./bot.cjs');
const { pdfToPng } = require('pdf-to-png-converter');
const { sendPrepareAction, UPLOAD_DOCUMENT } = require('../libs/tg-messages.cjs');
const { TELEGRAM } = require('../environments/index.cjs');

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
    if (!userInfo.tid) {
      return response.status(400).send('Telegram не подключен к аккаунту');
    }

    setJWT(userInfo.tid, userInfo.sub, tokens);
    updateUserTimezone(userInfo.tid, userInfo.tz);

    const inboxResponse = await fetch(userInfo.sub + '/inbox', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/activity+json',
        'Authorization': tokens.token_type + ' ' + tokens.access_token,
        'Timezone': userInfo.tz,
      },
    });
    if (!inboxResponse.ok) {
      return response.status(400).send('Unknown server error');
    }
    const result = await inboxResponse.json();
    const [item] = result.orderedItems;

    const waitingMessage = await bot.sendMessage(userInfo.tid, '⏳ Идет авторизация...', {
      reply_markup: {
        remove_keyboard: true,
      },
    });

    await sendPrepareAction(bot, userInfo.tid, UPLOAD_DOCUMENT);
    const objectResponse = await fetch(item.object, {
      method: 'GET',
      headers: {
        Accept: 'application/activity+json',
        Authorization: tokens.token_type + ' ' + tokens.access_token,
      },
    });
    if (!objectResponse.ok) {
      throw new Error('Unknown server error');
    }
    const { attachment } = await objectResponse.json();
    const [url] = attachment;
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
              'Продолжая использование сервиса ' +
              'Вы принимаете условия пользовательского Лицензионного соглашения /licence.'
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
<html lang="ru">
<head>
<link rel="preconnect" href="https://telegram.org">
<link rel="preload" href="https://telegram.org/js/telegram-web-app.js" as="script" fetchpriority="high">
<script src="https://telegram.org/js/telegram-web-app.js" fetchpriority="high"></script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="0; url='https://t.me/${TELEGRAM.BOT_NAME}?start=start'">
<title>Авторизация успешно пройдена</title>
<script>
window.location.hash ||= sessionStorage.getItem('__tma_hash');
window.Telegram.WebApp.ready();
window.Telegram.WebApp.close();
sessionStorage.clear();
</script>
</head>
<body style="display:none">
<h1 style="color: forestgreen">Аутентификация прошла успешно.</h1>
<script>
document.body.style.display = 'block';
</script>
</body>
</html>
  `.trim(),
    );
  } catch (error) {
    response.send(error.stack);
  }
};
