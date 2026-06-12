import fs from 'node:fs';
import https from 'node:https';
import express, { type Express } from 'express';
import session from 'express-session';
import cors from 'cors';
import minimist, { type ParsedArgs } from 'minimist';
import env from './environments/index.ts';
import botController from './controllers/bot.ts';
import vcLdJsonParser from './middleware/vc-ld-json-parser.ts';
import verifyCredential from './middleware/verify-credentials.ts';
import getUserMiddleware from './middleware/get-user.ts';
import pingController from './controllers/ping.ts';
import groupEventPostController from './controllers/group_event-post.ts';
import groupEventUpdateController from './controllers/group_event-put.ts';
import tokenController from './controllers/token.ts';
import loginController from './controllers/login.ts';
import loginControllerPost from './controllers/login-post.ts';
import fileController from './controllers/file.ts';
import transcriptionController from './controllers/transcription.ts';
import webhookController from './controllers/webhook.ts';

const { SERVER, SECRETARY } = env;
const argv: ParsedArgs = minimist(process.argv.slice(2));
const app: Express = express();
const port = Number(argv.port || 443);
const local = Boolean(argv.local);
const allowedHosts = new Set([
  new URL(SERVER.HOST).hostname,
  new URL(SERVER.APP_URL).hostname,
  new URL(SECRETARY.HOST).hostname,
]);

app.use(
  cors({
    origin(url, callback) {
      if (!url) {
        callback(null, true);
        return;
      }

      const parsedUrl = URL.parse(url);
      callback(null, Boolean(parsedUrl && allowedHosts.has(parsedUrl.hostname)));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Geolocation', 'X-Telegram-Chat-Id', 'X-Telegram-Message-Id'],
  }),
);
app.use(
  session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: 'none',
      secure: true,
    },
  }),
);
app.use(botController);
app.get('/', pingController);
app.post('/event', express.json(), getUserMiddleware, groupEventPostController);
app.put('/event', express.json(), getUserMiddleware, groupEventUpdateController);
app.get('/login', loginController);
app.post('/login', express.json(), loginControllerPost);
app.get('/token', tokenController);
app.get('/file/:file_id', fileController);
app.get('/transcription/:file_id', transcriptionController);
app.post('/webhook', vcLdJsonParser, verifyCredential, webhookController);

if (local) {
  const keyPath = 'certs/server/bot-key.pem';
  const certPath = 'certs/server/bot-cert.pem';

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error(`Missing TLS files: ${keyPath} or ${certPath}`);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }

  const key = fs.readFileSync(keyPath);
  const cert = fs.readFileSync(certPath);
  https.createServer({ key, cert }, app).listen(port, () => {
    console.log(`🔒 Telegram Server listening on: ${SERVER.HOST}:${port}`);
  });
} else {
  app.listen(port, () => {
    console.log(`🚀 Telegram Server is listening http://localhost:${port}`);
  });
}
