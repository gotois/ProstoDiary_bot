const express = require('express');
// const csrf = require('csurf');
const jsonParser = require('body-parser').json();
const { TELEGRAM } = require('../../environment');

const basic = require('../middlewares/auth');
const robotsParser = require('../middlewares/robots');
const sitemapParser = require('../middlewares/sitemap');
const notFound = require('../middlewares/not-found-handler');
const setNoCache = require('../middlewares/no-cache');
const telegramAPI = require('../middlewares/telegram');
const mailAPI = require('../middlewares/mail');
const rpcAPI = require('../middlewares/jsonrpc');

const OIDC = require('../controllers/web/oidc');
const OAUTH = require('../controllers/web/oauth');
const Marketplace = require('../controllers/web/assistants');
const BOT = require('../controllers/web/bot');

const passportController = require('../controllers/web/passport');
const indexController = require('../controllers/web/index-page');
const pingController = require('../controllers/web/ping');
const messageController = require('../controllers/web/message');

const body = express.urlencoded({ extended: false });

/**
 * @param {*} app - express application
 * @param {*} provider - oidc provider
 */
module.exports = (app, provider) => {
  const oidc = new OIDC(provider);
  const oauth = new OAUTH();
  const marketplace = new Marketplace();

  // registration
  app.get('/registration', oauth.registrationStart);
  app.post('/registration/oauth', body, oauth.registrationOauth);
  app.get('/oauth', oauth.callback); // rename to callback/oauth

  // bot
  app.get('/bot/activate', body, BOT.signin);
  app.get('/bot/deactivate', body, BOT.signout);

  // assistant marketplace
  app.get('/marketplace', marketplace.assistants);

  // JSON-LD пользователя/организации
  // todo добавить список историй сылками и пагинацией <Array>
  //  список сообщений истории определенного пользователя
  app.get('/user/:uuid/:date', basic.check(passportController));
  // отображение прикрепленных некий глобальный JSON-LD включающий ссылки на остальные документы
  app.get('/message/:uuid', basic.check(messageController));
  app.get('/robots.txt', robotsParser);
  app.get('/sitemap.txt', sitemapParser);
  // вебхуки нотификаций о почте, включая ассистентов
  app.post('/mail', jsonParser, mailAPI);
  // telegram
  app.post(`/bot${TELEGRAM.TOKEN}`, jsonParser, telegramAPI);
  app.get('/', indexController);
  app.get('/ping', basic.check(pingController));
  // json rpc server via header jwt
  app.post('/api*', jsonParser, rpcAPI);

  // OpenID Connect server
  app.get('/oidcallback', oidc.oidcallback.bind(oidc));
  app.get('/interaction/:uid', setNoCache, oidc.interactionUID.bind(oidc));
  app.post(
    '/interaction/:uid/login',
    setNoCache,
    body,
    oidc.interactionLogin.bind(oidc),
  );
  app.post(
    '/interaction/:uid/continue',
    setNoCache,
    body,
    oidc.interactionContinue.bind(oidc),
  );
  app.post(
    '/interaction/:uid/confirm',
    setNoCache,
    body,
    oidc.interactionConfirm.bind(oidc),
  );
  app.get(
    '/interaction/:uid/abort',
    setNoCache,
    oidc.interactionAbort.bind(oidc),
  );
  app.use('/oidc/', provider.callback);

  // todo настроить позже oidc страницы с формами с csrf
  // app.use(csrf({ cookie: true }));

  // 404 - not found - todo благодаря использованию oidsParser это не используется
  app.get('*', notFound);
};
