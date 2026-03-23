const fs = require('node:fs');
const https = require('node:https');
const { json } = require('node:stream/consumers');
const express = require('express');
const session = require('express-session');
const argv = require('minimist')(process.argv.slice(2));
const { OIDC } = require('./environments/index.cjs');
const botController = require('./controllers/bot.cjs');
const pingController = require('./controllers/ping.cjs');
const tokenController = require('./controllers/token.cjs');
const loginController = require('./controllers/login.cjs');
const {
  getUserByActorId,
} = require('./models/users.cjs');

const app = express();
const SECURE_PORT = 443;
const port = Number(argv.port || SECURE_PORT);

app.use(
  session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      sameSite: 'none',
      secure: true,
    },
  }),
);
app.use(botController);
app.get('/', pingController);
app.get('/login', loginController);
app.get('/token', tokenController);

async function vcLdJsonParser(req, res, next) {
  const rawContentType = req?.headers['content-type'] ?? (req?.get('content-type')) ?? '';
  const contentType = String(rawContentType).split(';')[0].trim().toLowerCase();

  if (contentType !== 'application/vc+ld+json') {
    return next();
  }

  try {
    const bodyObj = await json(req);
    req.body = bodyObj ?? {};
    next();
  } catch (err) {
    console.error('Не удалось использовать node:stream/consumers:', err && err.message ? err.message : err);
    next(err);
  }
}

app.post('/webhook', vcLdJsonParser, async (request, response) => {
  // ...
  const activity = request.body;


  switch (activity.type) {
    case 'Announce': {

      const keyboardOpen = {
        text: 'Посмотреть',
        url: activity.object,
      };
      const keyboardLater = {
        text: 'Пойду',
        callback_data: 'notify_calendar--15',
      };
      const keyboardLater60 = {
        text: 'Не пойду',
        callback_data: 'notify_calendar--60',
      };

      for (let to of activity.to) {
        const user = getUserByActorId(to);
        if (!user) {
          console.warn(`User from ${to} not found!`);
          continue;
        }

        await botController.bot.sendMessage(user.id, activity.summaryMap.ru, {
          protect_content: true,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [keyboardOpen],
              [keyboardLater, keyboardLater60],
            ],
          },
        });
      }
      break;
    }
    case 'Offer': {
      const keyboardOpen = {
        text: 'Посмотреть',
        url: activity.object,
      };
      // todo - при нажатии отправлять Post с типом Reject Activity
      const keyboardReject = {
        text: 'Отменить',
        callback_data: 'reject',
      };
      // todo - при нажатии отправлять Post с типом Accept Activity
      const keyboardAccept = {
        text: 'Принять',
        callback_data: 'accept',
      };
    default: {
      break;
    }
  }

  return response.status(202).send('Accepted');
});

if (port === SECURE_PORT) {
  const keyPath = 'cert/localhost.key';
  const certPath = 'cert/localhost.crt';

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error(`Missing TLS files: ${keyPath} or ${certPath}`);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }

  const key = fs.readFileSync(keyPath);
  const cert = fs.readFileSync(certPath);
  https.createServer({ key, cert }, app).listen(SECURE_PORT, () => {
    console.log('🔒 Telegram Server listening on: ' + OIDC.HOST);
  });
} else {
  app.listen(port, () => {
    console.log(`🚀 Telegram Server is listening port:${port}`);
  });
}
