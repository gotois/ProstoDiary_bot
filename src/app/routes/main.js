const express = require('express');
// const csrf = require('csurf');
const jsonParser = require('body-parser').json();
const { TELEGRAM } = require('../../environment');
const basic = require('../middlewares/auth-user');
const robotsParser = require('../middlewares/robots');
const sitemapParser = require('../middlewares/sitemap');
const setNoCache = require('../middlewares/no-cache');
const mailAPI = require('../middlewares/mail');
const TelegramController = require('../controllers/web/telegram');
const OidcController = require('../controllers/web/oidc');
const OauthController = require('../controllers/web/oauth');
const indexController = require('../controllers/web/index-page');
const passportController = require('../controllers/web/passport');

const router = express.Router();
const body = express.urlencoded({ extended: false });

module.exports = (oidcProvider) => {
  // OpenID Connect server
  const oidc = new OidcController(oidcProvider);
  const oauth = new OauthController();

  // todo перенести в routes/registration
  // registration
  router.get('/registration', oauth.registrationStart);
  router.post('/registration/oauth', body, oauth.registrationOauth);
  router.get('/oauth', oauth.callback); // todo rename to registration/oauth/callback

  // JSON-LD пользователя/организации - deprecated?
  router.get('/user/:uuid/:date', basic.check(passportController));

  router.get('/robots.txt', robotsParser);
  router.get('/sitemap.txt', sitemapParser);

  // telegram
  // todo использовать урл вида .../telegram/bot/...
  router.post(
    `/bot${TELEGRAM.TOKEN}`,
    jsonParser,
    TelegramController.webhookAPI,
  );

  router.get('/', indexController);

  // todo перенести в /assistants
  // вебхуки нотификаций о почте, включая ассистентов
  router.post('/mail', jsonParser, mailAPI);

  // oidc
  router.get('/oidcallback', oidc.oidcallback.bind(oidc));
  router.get('/interaction/:uid', setNoCache, oidc.interactionUID.bind(oidc));
  router.post(
    '/interaction/:uid/login',
    setNoCache,
    body,
    oidc.interactionLogin.bind(oidc),
  );
  router.post(
    '/interaction/:uid/continue',
    setNoCache,
    body,
    oidc.interactionContinue.bind(oidc),
  );
  router.post(
    '/interaction/:uid/confirm',
    setNoCache,
    body,
    oidc.interactionConfirm.bind(oidc),
  );
  router.get(
    '/interaction/:uid/abort',
    setNoCache,
    oidc.interactionAbort.bind(oidc),
  );

  // todo настроить позже oidc страницы с формами с csrf
  // app.use(csrf({ cookie: true }));

  return router;
};
