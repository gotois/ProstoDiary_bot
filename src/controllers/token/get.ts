import { promisify } from 'node:util';
import { pdfToPng } from 'pdf-to-png-converter';
import type { Request, Response } from 'express';

import { SERVER, TELEGRAM } from '#env';
import { container } from '../../app/container.ts';
import { bot } from '../../interfaces/bot.ts';
import { sendPrepareAction, UPLOAD_DOCUMENT } from '../../libs/tg-messages.ts';

function tmaSuccessPage(): string {
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="2; url='https://t.me/${TELEGRAM.BOT_NAME}?start=start'">
  <title>Авторизация успешно пройдена</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>
<body>
  <p>Авторизация успешно пройдена.</p>
  <script>
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.close();
  </script>
</body>
</html>
  `.trim();
}

export default async function getToken(request: Request, response: Response): Promise<Response | void> {
  if (request.query.error) {
    return response
      .status(400)
      .type('text/plain')
      .send(String(request.query.error_description ?? request.query.error));
  }

  try {
    const callbackUrl = new URL(request.originalUrl, SERVER.HOST);
    const result = await container.solidSessions.completeAuthorization(callbackUrl, request.sessionID);

    await promisify(request.session.regenerate.bind(request.session))();
    request.session.authorization_id = result.authorization.id;
    request.session.telegram_id = result.telegramId;
    request.session.token_type = result.authorization.tokenType;
    request.session.oauth_pending = false;
    await promisify(request.session.save.bind(request.session))();

    if (!result.isTma) {
      return response.redirect(303, SERVER.APP_URL);
    }

    if (result.telegramId !== undefined) {
      try {
        const welcome = await container.prepareAuthorizationWelcome.execute({
          actorId: result.authorization.webId,
          accessToken: result.authorization.accessToken,
          tokenType: result.authorization.tokenType,
          timezone: result.timezone,
          webhookUrl: `${SERVER.HOST}/webhook`,
        });
        if (welcome.documentUrl) {
          const waitingMessage = await bot.sendMessage(result.telegramId, '⏳ Идет авторизация...', {
            reply_markup: { remove_keyboard: true },
          });
          await sendPrepareAction(bot, result.telegramId, UPLOAD_DOCUMENT);
          const documentResponse = await fetch(welcome.documentUrl);
          const pngPages = await pdfToPng(Buffer.from(await documentResponse.arrayBuffer()));
          await bot.sendMediaGroup(
            result.telegramId,
            pngPages.map((page) => {
              return {
                type: 'photo',
                media: page.content,
                width: page.width,
                height: page.height,
                caption:
                  page.pageNumber === 1
                    ? 'Вы зарегистрированы!\nПродолжая использование сервиса Вы принимаете условия пользовательского Лицензионного соглашения /licence.'
                    : undefined,
              };
            }),
            {
              disable_notification: true,
              message_effect_id: '5046509860389126442',
              protect_content: true,
            },
          );
          await bot.deleteMessage(result.telegramId, waitingMessage.message_id);
        }
      } catch (error) {
        console.error('Post-authorization Telegram welcome failed:', error);
      }
    }

    return response.type('html').send(tmaSuccessPage());
  } catch (error) {
    console.error('OAuth callback failed:', error);
    return response.status(400).send('Authorization failed');
  }
}
