import fs from 'node:fs';
import https from 'node:https';
import express, { type Express } from 'express';
import session from 'express-session';
import cors from 'cors';
import { SESSION, SERVER, SECRETARY, IS_DEV } from '#env';
import botController from '../interfaces/bot.ts';
import vcLdJsonParser from '../middleware/vc-ld-json-parser.ts';
import verifyCredential from '../middleware/verify-credentials.ts';
import getUserMiddleware from '../middleware/get-user.ts';
import pingController from '#controllers/ping/get';
import calendarSubscriptionController from '#controllers/tasks/subscription/get';
import groupEventGetController from '#controllers/event/get';
import eventQueryController from '#controllers/event/query';
import groupEventPostController from '#controllers/event/post';
import groupEventUpdateController from '#controllers/event/put';
import groupEventRemoveController from '#controllers/event/delete';
import groupsController from '#controllers/groups/get';
import calendarGooglePostController from '#controllers/calendar-google/post';
import tokenController from '#controllers/token/get';
import loginController from '#controllers/login/get';
import loginControllerPost from '#controllers/login/post';
import { createSessionController } from '#controllers/session/post';
import fileController from '#controllers/file/get';
import transcriptionController from '#controllers/transcription/get';
import webhookController from '#controllers/webhook/post';
import { userRepository } from './container.ts';

/**
 * Создаёт Express-приложение Telegram сервера
 * @returns Express-приложение
 */
export function createServer(): Express {
  const app = express();
  const allowedHosts = new Set([
    new URL(SERVER.HOST).hostname,
    new URL(SERVER.APP_URL).hostname,
    new URL(SECRETARY.HOST).hostname,
  ]);
  if (IS_DEV) {
    allowedHosts.add('localhost');
  }

  app.use(
    cors({
      origin(url: string | undefined, callback: (error: Error | null, allowed?: boolean) => void) {
        if (!url) {
          return callback(undefined, true);
        }
        const parsedUrl = URL.parse(url);
        callback(undefined, Boolean(parsedUrl && allowedHosts.has(parsedUrl.hostname)));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Authorization',
        'DPoP',
        'Content-Type',
        'Geolocation',
        'Timezone',
      ],
    }),
  );
  app.use(
    session({
      secret: SESSION.secret,
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
  app.get('/event/query', getUserMiddleware, eventQueryController);
  app.get('/event/:taskId', getUserMiddleware, groupEventGetController);
  app.post('/event', express.json(), getUserMiddleware, groupEventPostController);
  app.put('/event', express.json(), getUserMiddleware, groupEventUpdateController);
  app.delete('/event', express.json(), getUserMiddleware, groupEventRemoveController);
  app.get('/groups', getUserMiddleware, groupsController);
  app.post('/calendar/google', express.json(), getUserMiddleware, calendarGooglePostController);
  app.get('/calendar/subscription', getUserMiddleware, calendarSubscriptionController);
  app.get('/login', loginController);
  app.post('/login', express.json(), loginControllerPost);
  app.post('/session', createSessionController({
    findUserByActorId: userRepository.findByActorId.bind(userRepository),
  }));
  app.get('/token', tokenController);
  app.get('/file/:file_id', fileController);
  app.get('/transcription/:file_id', transcriptionController);
  app.post('/webhook', vcLdJsonParser, verifyCredential, webhookController);
  return app;
}

/**
 * @description Запускает Telegram сервер
 * @param root - параметры запуска сервера
 * @param root.port - порт для прослушивания
 * @param root.local - использовать локальный HTTPS-сервер
 */
export function startServer({ port, local }: { port: number; local: boolean }): void {
  const app = createServer();
  if (local) {
    const keyPath = 'certs/server/bot-key.pem';
    const certPath = 'certs/server/bot-cert.pem';
    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath))
      throw new Error(`Missing TLS files: ${keyPath} or ${certPath}`);
    https.createServer({ key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }, app).listen(port, () => {
      console.log(
        `🔒 Telegram Server listening on: ${new URL(SERVER.HOST).protocol}//${new URL(SERVER.HOST).hostname}:${port}`,
      );
    });
    return;
  }
  app.listen(port, () => {
    console.log(`🚀 Telegram Server is listening http://localhost:${port}`);
  });
}
