const express = require('express');
// const csrf = require('csurf');
const jsonParser = require('body-parser').json();
const robotsParser = require('../controllers/web/robots');
const sitemapParser = require('../controllers/web/sitemap');
const setNoCache = require('../middlewares/no-cache');
const mailAPI = require('../middlewares/mail');
const OidcController = require('../controllers/web/oidc');
const OauthController = require('../controllers/web/oauth');
const indexController = require('../controllers/web/index-page');

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

  router.get('/robots.txt', robotsParser);
  router.get('/sitemap.txt', sitemapParser);

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
