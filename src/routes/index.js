const jsonParser = require('body-parser').json();
const authParser = require('../middlewares/auth');
const telegramParser = require('../middlewares/telegram');
const mailParser = require('../middlewares/mail');
const oauthParser = require('../middlewares/oauth');
const apiParser = require('../middlewares/jsonrpc');
const passportParser = require('../middlewares/id');
const messageParser = require('../middlewares/message');
const { TELEGRAM } = require('../environment');

module.exports = (app) => {
  // подтверждение авторизации oauth. Сначала переходить сначала по ссылке вида https://cd0b2563.eu.ngrok.io/connect/yandex. Через localhost не будет работать
  app.get('/oauth', oauthParser);

  // JSON-LD пользователя/организации
  // todo добавить список историй сылками и пагинацией <Array>
  //  список сообщений истории определенного пользователя
  app.get('/user/:uuid/:date', authParser, passportParser);
  // отображение прикрепленных некий глобальный JSON-LD включающий ссылки на остальные документы
  // todo делать читаемыми только для того пользователя и бота кто создал
  app.get('/message/:uuid', authParser, messageParser);
  // вебхуки нотификаций о почте, включая ассистентов
  app.post('/mail', jsonParser, mailParser);
  // telegram
  app.post(`/bot${TELEGRAM.TOKEN}`, jsonParser, telegramParser);

  app.get('/', authParser, require('./middlewares/ping'));

  // example oidc
  // app.get('/cb', (request) => {
  //   console.log(request);
  // });
  // json rpc server
  app.post('/api*', jsonParser, authParser, apiParser);
  // 404 - not found
  app.get('*', require('../middlewares/not-found-handler'));
};
