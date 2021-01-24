const express = require('express');
// const csrf = require('csurf');
const robotsParser = require('../controllers/web/robots');
const sitemapParser = require('../controllers/web/sitemap');
const indexController = require('../controllers/web/index-page');

const router = express.Router();

module.exports = () => {
  router.get('/robots.txt', robotsParser);
  router.get('/sitemap.txt', sitemapParser);

  router.get('/', indexController);

  // todo настроить позже определенные страницы с формами с csrf
  // app.use(csrf({ cookie: true }));

  return router;
};
