import test from 'ava';

// Simple Heroku Detect
if (!process.env.PORT || process.env.NODE_ENV !== 'TRAVIS_CI') {
  require('dotenv').config();
}
const { maintainers } = require('../../package');
const TelegramServer = require('telegram-test-api');
const TelegramBot = require('node-telegram-bot-api');
const sgMail = require('@sendgrid/mail');
const TestBot = require('./TestBot');
const { IS_CI, IS_DEV, SENDGRID } = require('../../src/env');
// TODO: https://github.com/gotois/ProstoDiary_bot/issues/106
// TRAVIS удалить, когда перенесу все необходимые env на Travis
const IS_FAST_TEST = Boolean(process.env.FAST_TEST);
const skipTestForFastOrTravis = IS_FAST_TEST || IS_CI ? test.skip : test;
const skipTestForFast = IS_FAST_TEST ? test.skip : test;

// This runs before all tests
test.before(async (t) => {
  if (IS_FAST_TEST) {
    t.log('IS FAST TEST');
  }
  // TODO: для dev запускаем дев сервак. В дальнейшем включить полноценно для E2E - https://github.com/gotois/ProstoDiary_bot/issues/3
  if (IS_DEV) {
    const dbClient = require('../../src/database/index');
    await t.notThrowsAsync(async () => {
      await dbClient.client.connect();
    });
    t.true(dbClient.client._connected);
  }
  const token = 'sampleToken';
  const server = new TelegramServer({
    port: 9000,
    host: 'localhost',
    storage: 'RAM',
    storeTimeout: 60,
  });

  await server.start();
  const client = server.getClient(token);

  let botOptions = { polling: true, baseApiUrl: server.ApiURL };
  const telegramBot = new TelegramBot(token, botOptions);
  new TestBot(telegramBot);
  t.context.server = server;
  t.context.client = client;
  t.context.tasks = {};
  t.pass();
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
  if (IS_FAST_TEST) {
    return;
  }
  if (IS_CI) {
    return;
  }
  if (IS_DEV) {
    return;
  }
  if (t.context.testPassed) {
    return;
  }
  const failedTasks = Object.entries(t.context.tasks).map(([taskName]) => {
    return taskName;
  });
  t.log('Failed: ', failedTasks);
  sgMail.setApiKey(SENDGRID.SENDGRID_API_KEY);
  const msg = {
    to: maintainers[0].email,
    from: 'no-reply@gotointeractive.com',
    subject: 'ProstoDiary: 👾 E2E failed',
    text: `Failed test: ${JSON.stringify(failedTasks, null, 2)}`,
  };
  const [mailResult] = await sgMail.send(msg);
  t.true(mailResult.statusCode >= 200 && mailResult.statusCode < 300);
});

// Database
skipTestForFastOrTravis(
  'Database Foods',
  require('./database.test').databaseFoods,
);

// API
skipTestForFast('API: speller service', require('./speller-service.test'));
skipTestForFast('API: request', require('./request.test'));
skipTestForFast('API: Weather', require('./weather.test'));
skipTestForFast('API: RestContries', require('./restcountries.test'));
skipTestForFast('API: plotly', require('./graph-service.test'));

skipTestForFastOrTravis('API: Fatsecret', require('./fatsecret.test'));
skipTestForFastOrTravis('API: Google Vision', require('./vision.test'));
skipTestForFastOrTravis('API: KPP nalog.ru', require('./kpp.test'));
skipTestForFastOrTravis('API: Translate', require('./translate.test'));

// INPUT
skipTestForFast('/help', require('./help.test'));
skipTestForFast('/version', require('./version.test'));
skipTestForFastOrTravis('INPUT: voice', require('./voice.test'));

test.todo('/start');
test.todo('/dbclear');
test.todo('/download');
test.todo('/search');
test.todo('авторизация');
test.todo('Создать отдельного пользователя в БД'); // TODO: используя https://github.com/marak/Faker.js/
test.todo('Проверка удаления своей записи');
test.todo('Запись энтри');
test.todo('Проверека построения графика');
test.todo('проверка скачивания архива');
