const fs = require('node:fs');
const https = require('node:https');
const express = require('express');
const session = require('express-session');
const argv = require('minimist')(process.argv.slice(2));
const { OIDC } = require('./environments/index.cjs');
const botController = require('./controllers/bot.cjs');
const vcLdJsonParser = require('./middleware/vc-ld-json-parser.cjs');
const verifyCredential = require('./middleware/verify-credentials.cjs');
const pingController = require('./controllers/ping.cjs');
const tokenController = require('./controllers/token.cjs');
const loginController = require('./controllers/login.cjs');
const webhookController = require('./controllers/webhook.cjs');

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
app.post('/webhook', vcLdJsonParser, verifyCredential, webhookController);

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
