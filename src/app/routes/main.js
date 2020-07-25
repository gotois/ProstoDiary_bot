const express = require('express');
// const csrf = require('csurf');
const robotsParser = require('../controllers/web/robots');
const sitemapParser = require('../controllers/web/sitemap');
const setNoCache = require('../middlewares/no-cache');
const OidcController = require('../controllers/web/oidc');
const OauthController = require('../controllers/web/oauth');
const indexController = require('../controllers/web/index-page');

const router = express.Router();
const body = express.urlencoded({ extended: false });

module.exports = (oidcProvider) => {
  // OpenID Connect server
  const oidc = new OidcController(oidcProvider);

  // registration - todo перенести в routes/registration
  router.get('/registration', OauthController.registrationStart);
  router.post('/registration/oauth', body, OauthController.registrationOauth);
  router.get('/oauth', OauthController.registractionCallback);

  router.get('/robots.txt', robotsParser);
  router.get('/sitemap.txt', sitemapParser);

  router.get('/', indexController);

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
