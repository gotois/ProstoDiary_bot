import type { Request, Response } from 'express';

import { SECRETARY } from '#env';

/**
 * Telegram WebApp bridge used by the bot's /start authorization button.
 * @param _request - Express request
 * @param response - Express response
 * @returns HTML bridge page
 */
export default function getLogin(_request: Request, response: Response): Response {
  return response.type('html').send(
    `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Авторизация</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>
<body>
  <p>Перенаправление на авторизацию…</p>
  <form id="login" method="post" action="/login">
    <input type="hidden" name="oidcIssuer" value="${SECRETARY.HOST}">
    <input id="initData" type="hidden" name="initData">
  </form>
  <script>
    window.Telegram.WebApp.ready();
    const initData = window.Telegram.WebApp.initData;
    if (!initData) {
      document.body.textContent = 'Откройте авторизацию из Telegram-бота.';
    } else {
      document.getElementById('initData').value = initData;
      document.getElementById('login').submit();
    }
  </script>
</body>
</html>
  `.trim(),
  );
}
