import type { Request, Response } from 'express';
import { pdfToPng } from 'pdf-to-png-converter';
import { container } from '../../app/container.ts';
import { toUserTokenInput } from '../../infrastructure/auth/user-token-input.ts';
import { bot } from '../../interfaces/telegram/bot.ts';
import { sendPrepareAction, UPLOAD_DOCUMENT } from '../../libs/tg-messages.ts';
import { TELEGRAM, SERVER } from '#env';

export default async (request: Request, response: Response): Promise<Response> => {
  if (request.query?.error) {
    return response.status(400).send(`
    <h1>${request.query.error_description}</h1>
    `);
  }

  if (!request.session.code_verifier || !request.session.state) {
    return response.status(400).send('Missing PKCE verifier or state in session');
  }

  const callbackUrl = new URL(request.url, `https://${request.headers.host}`);

  try {
    const authorization = await container.completeAuthorization.execute({
      callbackUrl,
      codeVerifier: request.session.code_verifier,
      state: request.session.state,
    });

    await container.saveUserTokens.execute(
      toUserTokenInput({
        telegramId: authorization.telegramId,
        actorId: authorization.actorId,
        tokens: {
          access_token: authorization.tokens.accessToken,
          id_token: authorization.tokens.idToken,
          refresh_token: authorization.tokens.refreshToken,
        },
      }),
    );
    await container.updateUserTimezone.execute({
      telegramId: authorization.telegramId,
      timezone: authorization.timezone,
    });

    const welcome = await container.prepareAuthorizationWelcome.execute({
      actorId: authorization.actorId,
      accessToken: authorization.tokens.accessToken,
      tokenType: authorization.tokens.tokenType,
      timezone: authorization.timezone,
      webhookUrl: `${SERVER.HOST}/webhook`,
    });
    if (!welcome.documentUrl) {
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
      return;
    }

    const waitingMessage = await bot.sendMessage(authorization.telegramId, '⏳ Идет авторизация...', {
      reply_markup: {
        remove_keyboard: true,
      },
    });

    await sendPrepareAction(bot, authorization.telegramId, UPLOAD_DOCUMENT);
    const responseDocument = await fetch(welcome.documentUrl);
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
    await bot.sendMediaGroup(authorization.telegramId, photos, {
      disable_notification: true,
      message_effect_id: '5046509860389126442', // 🎉
      protect_content: true,
      reply_markup: {
        keyboard: [],
      },
    });
    await bot.deleteMessage(authorization.telegramId, waitingMessage.message_id);

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
