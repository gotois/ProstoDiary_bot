const {
  test,
  skipTestForFastOrTravis,
  skipTestForFast,
} = require('../helpers');
const package_ = require('../../package');
const TelegramServer = require('telegram-test-api');
const { mail } = require('../../src/lib/sendgrid');
const {
  IS_CI,
  IS_PRODUCTION,
  SERVER,
  TELEGRAM,
} = require('../../src/environment');
/**
 * This runs before all tests
 */
test.before(async (t) => {
  const server = new TelegramServer({
    host: SERVER.HOST,
    port: SERVER.PORT,
    storage: 'RAM',
    storeTimeout: 60,
  });
  await server.start();
  require('../../src/core/bot');
  t.log(`TelegramServer: ${SERVER.HOST}:${SERVER.PORT} started`);
  const client = server.getClient(TELEGRAM.TOKEN);
  /*eslint-disable require-atomic-updates */
  t.context.server = server;
  t.context.client = client;
  t.context.tasks = {};
  /*eslint-enable */
  // todo uncomment?
  // const message = client.makeMessage('/ping');
  // await client.sendMessage(message);
  // try {
  //   await client.getUpdates();
  //   t.pass();
  // } catch (error) {
  //   t.fail('Telegram Server not response: ' + error);
  // }
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
skipTestForFastOrTravis('API: script', require('./script.test'));
skipTestForFast('API: speller service', require('./speller-service.test'));
skipTestForFast('API: request', require('./request.test'));
skipTestForFast('API: Location', require('./location.test'));
skipTestForFastOrTravis(
  'API: dialogflow',
  require('./dialogflow-service.test'),
);
skipTestForFastOrTravis('API: googleapis Geocode', require('./geocode.test'));
skipTestForFastOrTravis('API: Google Vision', require('./vision.test'));
skipTestForFastOrTravis('API: Translate', require('./translate.test'));

// Telegram commands
skipTestForFastOrTravis('/help', require('./help.test'));
skipTestForFastOrTravis('/backup', require('./backup.test'));
skipTestForFastOrTravis('/post', require('./post.test'));
skipTestForFastOrTravis('/ping', require('./ping.test'));
skipTestForFastOrTravis('Создать отдельного пользователя в БД', require('./passport-db.test'));
test.todo('/start');
test.todo('/dbclear');
test.todo('Проверка удаления своей записи');
test.todo('/search'); // + Проверека построения графика

skipTestForFastOrTravis('INPUT: voice', require('./voice.test'));

skipTestForFastOrTravis('story', require('./story.test'));

skipTestForFastOrTravis('archive service', require('./archive-service.test'));
skipTestForFastOrTravis('foursquare', require('./foursquare-service.test'));

// urls
skipTestForFastOrTravis('/id/', require('./json-ld.test'));

test('dictionary', async t => {
  const dictionary = require('../../src/lib/dictionary');
  const { def } = await dictionary({ text: 'eat'});

  const synonyms = [];
  for (const d of def) {
    synonyms.push(d.tr[0].text);

    d.tr[0].syn.forEach(syn => {
      synonyms.push(syn.text);
    });
  }

  t.true(Array.isArray(synonyms));
});

skipTestForFastOrTravis('language service', async t => {
  const languageService = require('../../src/services/nlp.service');

  const analyzedEntities = await languageService.analyzeEntities('я поел салат');
  const { entities, language } = analyzedEntities;
  const { tokens } = await languageService.analyzeSyntax('я поел салат');

  t.is(!!entities, true);
  t.is(!!language, true);
  t.is(!!tokens, true);

  // todo или единый запрос. Пока только поддерживатеся английский
  // const { categories, documentSentiment, } = await languageService.annotateText('I was play in Angry Birds ');
});

test('bot init', require('./telegram-bot.test'));
