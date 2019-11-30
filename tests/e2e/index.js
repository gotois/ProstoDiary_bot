const {
  test,
  skipTestForFastOrTravis,
  skipTestForFast,
} = require('../helpers');
const package_ = require('../../package');
const TelegramServer = require('telegram-test-api');
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
  const { mail } = require('../../src/services/sendgridmail.service');
  const [mailResult] = await mail.send({
    to: package_.maintainers[0].email,
    from: package_.author.email,
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
skipTestForFast('API: RestCountries', require('./restcountries.test'));
skipTestForFast('API: plotly', require('./graph-service.test'));
skipTestForFastOrTravis(
  'API: dialogflow',
  require('./dialogflow-service.test'),
);
skipTestForFastOrTravis('API: googleapis Geocode', require('./geocode.test'));
skipTestForFastOrTravis('API: Google Vision', require('./vision.test'));
skipTestForFastOrTravis('API: Translate', require('./translate.test'));
skipTestForFast('API: Wolfram Alpha', require('./wolfram-alpha.test'));
skipTestForFastOrTravis('API: Todoist', require('./todoist-service.test'));
skipTestForFast('API: Currency', require('./currency-service.test'));

// Telegram commands
skipTestForFastOrTravis('/help', require('./help.test'));
skipTestForFastOrTravis('/backup', require('./backup.test'));
skipTestForFastOrTravis('/post', require('./post.test'));
skipTestForFastOrTravis('/ping', require('./ping.test'));
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

// urls
skipTestForFastOrTravis('/id/', require('./json-ld.test'));

test('bot init', require('./telegram-bot.test'));
