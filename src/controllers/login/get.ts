import type { Request, Response } from 'express';
import { container } from '../../app/container.ts';

export default async (request: Request, response: Response): Promise<Response> => {
  try {
    const authorization = await container.oidc.startAuthorization({});
    request.session.code_verifier = authorization.codeVerifier;
    request.session.state = authorization.state;
    request.session.save();

    return response.send(`
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
            window.location.replace('${authorization.url}');
          }
        </script>
      </head>
      <body>Перенаправление...</body>
    </html>
  `);
  } catch (error) {
    console.error(error);
    return response.status(400).send('Произошла ошибка авторизации клиента');
  }
};
