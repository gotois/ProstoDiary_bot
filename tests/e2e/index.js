/* eslint-disable unicorn/no-null */
/* eslint-disable unicorn/no-useless-undefined */
const {
  test,
  skipTestForFastOrTravis,
  skipTestForFast,
} = require('../helpers');
const package_ = require('../../package.json');
const TelegramServer = require('telegram-test-api');
const { mail } = require('../../src/lib/sendgrid');
const {
  IS_CI,
  IS_PRODUCTION,
  SERVER,
  TELEGRAM,
} = require('../../src/environment');
const express = require('express');
const app = express();
const { getPemKeys } = require('../helpers/pem-keys');
/**
 * This runs before all tests
 */
test.before(async (t) => {
  const { publicKey, privateKey } = getPemKeys(t);
  t.context.publicKey = publicKey;
  t.context.privateKey = privateKey;

  const server = new TelegramServer({
    host: SERVER.HOST,
    port: SERVER.PORT,
    storage: 'RAM',
    storeTimeout: 60,
  });
  await server.start();
  require('../../src/include/telegram-bot/bot');
  t.log(`TelegramServer: ${SERVER.HOST}:${SERVER.PORT} started`);
  const client = server.getClient(TELEGRAM.TOKEN);
  /*eslint-disable require-atomic-updates */
  t.context.server = server; // TelegramServer context
  t.context.client = client;
  t.context.tasks = {};
  t.context.app = app; // ExpressServer context
  /*eslint-enable */

  // hack пробрасываем в глобальную область объект сервера
  global.app = app;
  // замокапленный json-rpc backend
  app.post('/api', (request, response) => {
    const jsonldResponse = {
      '@context': 'http://schema.org',
      '@type': 'AcceptAction',
      'agent': { '@type': 'Person', 'name': 'prosto-diary' },
      'purpose': {
        '@type': 'Answer',
        'abstract': 'pong',
        'encodingFormat': 'text/plain',
      },
    };
    response
      .status(200)
      .json({ jsonrpc: '2.0', result: jsonldResponse, id: 1 });
  });
});

test.beforeEach((t) => {
  const startedTestTitle = t.title.replace('beforeEach hook for ', '');
  t.context.tasks[startedTestTitle] = startedTestTitle;
});

test.afterEach((t) => {
  const successTestTitle = t.title.replace('afterEach hook for ', '');
  delete t.context.tasks[successTestTitle];
});

// This runs after all tests
test.after.always('guaranteed cleanup', async (t) => {
  if (!t.context.tasks) {
    return;
  }
  const failedTasks = Object.entries(t.context.tasks).map(([taskName]) => {
    return taskName;
  });
  if (failedTasks.length === 0) {
    return;
  }
  t.log('Failed: ', failedTasks);
  if (process.env.FAST_TEST || IS_CI || !IS_PRODUCTION) {
    return;
  }
  const [mailResult] = await mail.send({
    to: package_.maintainers[0].email,
    from: package_.author.email,
    subject: '👾 ProstoDiary 🐛: E2E tests failed',
    html: `
      <pre>${JSON.stringify(failedTasks, null, 2)}</pre>
    `,
  });
  t.true(mailResult.statusCode >= 200 && mailResult.statusCode < 400);
});

// API
skipTestForFast('API: request', require('./request.test'));

// Telegram commands
skipTestForFastOrTravis('/help', require('./help.test'));
skipTestForFastOrTravis('/backup', require('./backup.test'));
skipTestForFastOrTravis('/post', require('./post.test'));
skipTestForFastOrTravis('/ping', require('./ping.test'));
skipTestForFastOrTravis(
  'Создать отдельного пользователя в БД',
  require('./passport-db.test'),
);

test.todo('/start');
test.todo('/dbclear');
test.todo('Проверка удаления своей записи');
test.todo('/search'); // + Проверка построения графика

test('dictionary', async (t) => {
  const { getSynonyms } = require('../../src/lib/dictionary');
  const synonyms = await getSynonyms('eat');
  t.true(Array.isArray(synonyms));
});

skipTestForFastOrTravis('keys:jsonld', require('./keys.test'));

test('bot init', require('./telegram-bot.test'));
