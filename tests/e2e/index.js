const {
  test,
  skipTestForFastOrTravis,
  skipTestForFast,
} = require('../helpers');
const pkg = require('../../package');
const TelegramServer = require('telegram-test-api');
const {
  IS_CI,
  IS_PRODUCTION,
  TELEGRAM_TEST_SERVER,
  TELEGRAM,
} = require('../../src/environment');

/**
 * This runs before all tests
 */
test.before(async (t) => {
  const dbClient = require('../../src/core/database');
  await t.notThrowsAsync(async () => {
    await dbClient.client.connect();
  });
  t.true(dbClient.client._connected);

  const server = new TelegramServer({
    port: TELEGRAM_TEST_SERVER.PORT,
    host: TELEGRAM_TEST_SERVER.HOST,
    storage: 'RAM',
    storeTimeout: 60,
  });
  await server.start();
  t.log(
    `TelegramServer: ${TELEGRAM_TEST_SERVER.HOST}:${TELEGRAM_TEST_SERVER.PORT} started`,
  );
  const bot = require('../../src/core/bot');
  const client = server.getClient(TELEGRAM.TOKEN);
  require('../../src/core/handlers')(bot);
  /*eslint-disable require-atomic-updates */
  t.context.server = server;
  t.context.client = client;
  t.context.tasks = {};
  /*eslint-enable */
  // todo uncomment
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
test.after('cleanup', (t) => {
  t.context.testPassed = true;
});

test.after.always('guaranteed cleanup', async (t) => {
  if (t.context.testPassed || !t.context.tasks) {
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
  const sgMail = require('../../src/services/sendgridmail.service');
  const [mailResult] = await sgMail.send({
    to: pkg.maintainers[0].email,
    from: pkg.author.email,
    subject: '👾 ProstoDiary 🐛: E2E tests failed',
    text: JSON.stringify(failedTasks, null, 2),
  });
  t.true(mailResult.statusCode >= 200 && mailResult.statusCode < 400);
});

// Database
skipTestForFastOrTravis('DB: Foods', require('./database.test').databaseFoods);

// API
skipTestForFastOrTravis('API: script', require('./script.test'));
skipTestForFast('API: speller service', require('./speller-service.test'));
skipTestForFast('API: request', require('./request.test'));
skipTestForFast('API: Weather', require('./weather.test'));
skipTestForFast('API: RestContries', require('./restcountries.test'));
skipTestForFast('API: plotly', require('./graph-service.test'));
skipTestForFastOrTravis(
  'API: dialogflow',
  require('./dialogflow-service.test'),
);
skipTestForFastOrTravis('API: googleapis Geocode', require('./geocode.test'));
skipTestForFastOrTravis('API: Fatsecret', require('./fatsecret.test'));
skipTestForFastOrTravis('API: Google Vision', require('./vision.test'));
skipTestForFastOrTravis('API: KPP nalog.ru', require('./kpp.test'));
skipTestForFastOrTravis('API: Translate', require('./translate.test'));
skipTestForFast('API: Wolfram Alpha', require('./wolfram-alpha.test'));
skipTestForFastOrTravis('API: Todoist', require('./todoist-service.test'));
skipTestForFast('API: Currency', require('./currency-service.test'));

// INPUT
skipTestForFast('/help', require('./help.test'));
skipTestForFast('/version', require('./version.test'));
skipTestForFastOrTravis('/backup', require('./backup.test'));
skipTestForFastOrTravis('/post', require('./post.test'));
skipTestForFastOrTravis('/balance', require('./balance.test'));
test.todo('/start');
test.todo('/dbclear');
test.todo('Создать отдельного пользователя в БД'); // TODO: используя https://github.com/marak/Faker.js/
test.todo('Проверка удаления своей записи');
test.todo('/search'); // + Проверека построения графика

skipTestForFastOrTravis('INPUT: voice', require('./voice.test'));

skipTestForFastOrTravis('archive service', require('./archive-service.test'));
skipTestForFastOrTravis('AppleHealth', require('./apple-health-service.test'));
skipTestForFastOrTravis('Tinkoff', require('./tinkoff-service.test'));
skipTestForFastOrTravis('foursquare', require('./foursquare-service.test'));

test('bot init', require('./telegram-bot.test'));
