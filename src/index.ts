import fs from 'node:fs';
import https from 'node:https';
import express, { type Express } from 'express';
import session from 'express-session';
import cors from 'cors';
import minimist, { type ParsedArgs } from 'minimist';
import { SERVER, SECRETARY } from '#env';
import botController from './controllers/bot.ts';
import vcLdJsonParser from './middleware/vc-ld-json-parser.ts';
import verifyCredential from './middleware/verify-credentials.ts';
import getUserMiddleware from './middleware/get-user.ts';
import pingController from './controllers/ping/get.ts';
import calendarSubscriptionController from './controllers/tasks/subscription/get.ts';
import groupEventGetController from './controllers/group-event/get.ts';
import groupEventPostController from './controllers/group-event/post.ts';
import groupEventUpdateController from './controllers/group-event/put.ts';
import groupEventRemoveController from './controllers/group-event/delete.ts';
import groupsController from './controllers/groups/get.ts';
import calendarGooglePostController from './controllers/calendar-google/post.ts';
import tokenController from './controllers/token/get.ts';
import loginController from './controllers/login/get.ts';
import loginControllerPost from './controllers/login/post.ts';
import fileController from './controllers/file/get.ts';
import transcriptionController from './controllers/transcription/get.ts';
import webhookController from './controllers/webhook/post.ts';

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
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'Geolocation',
      'Timezone',
      // 'X-Telegram-Message-Id',
    ],
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
app.get('/event/:taskId', getUserMiddleware, groupEventGetController);
app.post('/event', express.json(), getUserMiddleware, groupEventPostController);
app.put('/event', express.json(), getUserMiddleware, groupEventUpdateController);
app.delete('/event', express.json(), getUserMiddleware, groupEventRemoveController);
app.get('/groups', getUserMiddleware, groupsController);
app.post('/calendar/google', express.json(), getUserMiddleware, calendarGooglePostController);
app.get('/calendar/subscription', getUserMiddleware, calendarSubscriptionController);
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
    const host = new URL(SERVER.HOST);
    console.log(`🔒 Telegram Server listening on: ${host.protocol}//${host.hostname}:${port}`);
  });
} else {
  app.listen(port, () => {
    console.log(`🚀 Telegram Server is listening http://localhost:${port}`);
  });
}
