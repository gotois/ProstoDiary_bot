const express = require('express');
const jsonParser = require('body-parser').json();
const { TELEGRAM } = require('../environment');
const authParser = require('../middlewares/auth');
const robotsParser = require('../middlewares/robots');
const sitemapParser = require('../middlewares/sitemap');
const oidcParser = require('../middlewares/oidc');
const telegramController = require('../middlewares/telegram');
const mailController = require('../middlewares/mail');
const oauthParser = require('../middlewares/oauth');
const apiController = require('../middlewares/jsonrpc');
const passportParser = require('../middlewares/id');
const messageController = require('../middlewares/message');
const pingController = require('../middlewares/ping');
const notFoundController = require('../middlewares/not-found-handler');
const setNoCache = require('../middlewares/no-cache');
const Account = require('../models/account');

module.exports = (app) => {
  app.get('/oidcallback', (request, response) => {
    if (request.error) {
      response.send(request.error);
      return;
    }
    response.send(`code: ${request.query.code}`);
  });
  app.get('/interaction/:uid', setNoCache, async (request, response, next) => {
    try {
      const details = await oidcParser.interactionDetails(request);
      const { uid, prompt } = details;
      // const client = await oidsParser.Client.find(details.params.client_id);
      // console.log(client)

      if (prompt.name === 'login') {
        response.send(`
      <form autocomplete="off" action="/interaction/${uid}/login" method="post">
        <input required type="email" name="email" placeholder="Enter an email" autofocus="on">
        <input required type="password" name="password" placeholder="and password">
        <button type="submit" class="login login-submit">Sign-in</button>
      </form>
       <div class="login-help">
        <a href="/interaction/${uid}/abort">[ Cancel ]</a>
      </div>
        `);
        return;
      }

      response.send(`
      <form autocomplete="off" action="/interaction/${uid}/confirm" method="post">
        <button autofocus type="submit" class="login login-submit">Continue</button>
      </form>
      <div class="login-help">
        <a href="/interaction/${uid}/abort">[ Cancel ]</a>
      </div>
`);
    } catch (error) {
      return next(error);
    }
  });
  app.post(
    '/interaction/:uid/login',
    setNoCache,
    express.urlencoded(),
    async (request, response, next) => {
      try {
        // const { params } = await oidsParser.interactionDetails(req);
        // const client = await oidsParser.Client.find(params.client_id);
        // console.log('req', client)
        const accountId = await Account.authenticate(
          request.body.email,
          request.body.password,
        );
        if (!accountId) {
          response.send('Invalid email or password.');
          return;
        }
        const result = {
          login: {
            account: accountId,
          },
        };
        await oidcParser.interactionFinished(request, response, result, {
          mergeWithLastSubmission: false,
        });
      } catch (error) {
        next(error);
      }
    },
  );
  app.post(
    '/interaction/:uid/confirm',
    setNoCache,
    async (request, response, next) => {
      try {
        const result = {
          consent: {
            // rejectedScopes: [], // < uncomment and add rejections here
            // rejectedClaims: [], // < uncomment and add rejections here
          },
        };
        await oidcParser.interactionFinished(request, response, result, {
          mergeWithLastSubmission: true,
        });
      } catch (error) {
        next(error);
      }
    },
  );
  app.get(
    '/interaction/:uid/abort',
    setNoCache,
    async (request, response, next) => {
      try {
        const result = {
          error: 'access_denied',
          error_description: 'End-User aborted interaction',
        };
        await oidcParser.interactionFinished(request, response, result, {
          mergeWithLastSubmission: false,
        });
      } catch (error) {
        next(error);
      }
    },
  );
  // подтверждение авторизации oauth. Сначала переходить сначала по ссылке вида https://cd0b2563.eu.ngrok.io/connect/yandex. Через localhost не будет работать
  app.get('/oauth', oauthParser);
  // JSON-LD пользователя/организации
  // todo добавить список историй сылками и пагинацией <Array>
  //  список сообщений истории определенного пользователя
  app.get('/user/:uuid/:date', authParser, passportParser);
  // отображение прикрепленных некий глобальный JSON-LD включающий ссылки на остальные документы
  // todo делать читаемыми только для того пользователя кто создал. Нужны роли для этого
  app.get('/message/:uuid', authParser, messageController);
  app.get('/robots.txt', robotsParser);
  app.get('/sitemap.txt', sitemapParser);
  // вебхуки нотификаций о почте, включая ассистентов
  app.post('/mail', jsonParser, mailController);
  // telegram
  app.post(`/bot${TELEGRAM.TOKEN}`, jsonParser, telegramController);
  app.get('/', authParser, pingController);
  // json rpc server
  app.post('/api*', jsonParser, authParser, apiController);
  // OpenID Connect server
  app.use('/oidc/', oidcParser.callback);
  // 404 - not found - todo благодаря использованию oidsParser это не используется
  app.get('*', notFoundController);
};
