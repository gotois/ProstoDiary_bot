import test from 'ava';

// Simple Heroku Detect
if (!process.env.PORT || process.env.NODE_ENV !== 'TRAVIS_CI') {
  require('dotenv').config();
}
const { maintainers } = require('../../package');
const fs = require('fs');
const TelegramServer = require('telegram-test-api');
const TelegramBot = require('node-telegram-bot-api');
const sgMail = require('@sendgrid/mail');
const TestBot = require('./TestBot');
const { IS_TRAVIS_CI } = require('../../src/env');

// TODO: https://github.com/gotois/ProstoDiary_bot/issues/106
// TRAVIS удалить, когда перенесу все необходимые env на Travis
const IS_FAST_TEST = Boolean(process.env.FAST_TEST);
const skipTestForFastOrTravis = IS_FAST_TEST || IS_TRAVIS_CI ? test.skip : test;
const skipTestForFast = IS_FAST_TEST ? test.skip : test;

// This runs before all tests
test.before(async (t) => {
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

test('/help', async (t) => {
  const { client } = t.context;
  let message = client.makeMessage('/help');
  await client.sendMessage(message);

  let updates = await client.getUpdates();
  t.true(updates.ok);
  // message = client.makeMessage(keyboard[0][0].text);
});

test('/version', async (t) => {
  const { client } = t.context;
  let message = client.makeMessage('/version');
  await client.sendMessage(message);
  let updates = await client.getUpdates();
  t.true(updates.ok);
  const { version } = require('../../package');
  t.true(updates.result[0].message.text.startsWith(version));
});

skipTestForFastOrTravis('vision', async (t) => {
  const visionService = require('../../src/services/vision.service');
  const buffer = fs.readFileSync('tests/data/photo/receipt-example-1.jpg');
  const result = await visionService.detect(buffer);
  t.true(Array.isArray(result.labelAnnotations));
  const receipt = result.labelAnnotations.find((annotation) => {
    return annotation.description === 'Receipt';
  });
  t.is(typeof receipt === 'object', true);
});

skipTestForFast('Проверка считывания qr', async (t) => {
  const qr = require('../../src/services/qr.service');
  const buffer = fs.readFileSync('tests/data/photo/qr-example-1.jpg');
  const qrResult = await qr.readQR(buffer);
  const params = qr.getParams(qrResult);
  t.true(params.hasOwnProperty('fn'));
  t.true(params.hasOwnProperty('fp'));
  t.true(params.hasOwnProperty('i'));
  t.true(params.hasOwnProperty('n'));
  t.true(params.hasOwnProperty('s'));
  t.true(params.hasOwnProperty('t'));
  t.is(params.fn, '9286000100125664');
  t.is(params.t, '20181228T1319');
});

skipTestForFastOrTravis('КПП API nalog.ru', async (t) => {
  t.timeout(5000);
  const kpp = require('../../src/services/kpp.service');
  const FN = '9286000100125664';
  const FD = '967';
  const FDP = '841348588';
  const TYPE = '1';
  const DATE = '20181228T1319';
  const SUM = '299.90';
  await kpp.checkKPP({ FN, FD, FDP, TYPE, DATE, SUM });
  const kppData = await kpp.getKPPData({ FN, FD, FDP });
  t.is(kppData.dateTime, '2018-12-28T13:19:00');
  t.true(Array.isArray(kppData.items));
  t.is(kppData.items[0].price, 14995);
  t.is(kppData.items[0].quantity, 1);
  t.is(kppData.items[0].sum, 14995);
  t.is(kppData.totalSum, 29990);
});

skipTestForFastOrTravis('voice', async (t) => {
  t.timeout(4000);
  const voiceService = require('../../src/services/voice.service');
  const buffer = fs.readFileSync('tests/data/voice/voice-example-1.ogg');
  const text = await voiceService.voiceToText(buffer, {
    duration: 1,
    mime_type: 'audio/ogg',
    file_size: 3141,
  });
  t.is(text, 'тестовое сообщение');
});

skipTestForFast('/weather', async (t) => {
  t.timeout(1000);
  const weatherService = require('../../src/services/weather.service');
  const weatherInfo = await weatherService.getWeather({
    latitude: 50.0467656,
    longitude: 20.0048731,
  });
  t.true(typeof weatherInfo === 'object');
  t.true(weatherInfo.hasOwnProperty('description'));
  t.true(weatherInfo.hasOwnProperty('humidity'));
  t.true(weatherInfo.hasOwnProperty('pressure'));
  t.true(weatherInfo.hasOwnProperty('rain'));
  t.true(weatherInfo.hasOwnProperty('temp'));
  t.true(weatherInfo.hasOwnProperty('weathercode'));
  t.is(weatherInfo.weathercode, 800);
});

skipTestForFast('fatsecret', async (t) => {
  t.timeout(2000);
  const foodService = require('../../src/services/food.service');
  const results = await foodService.search('Soup', 2);
  t.true(Array.isArray(results.foods.food));
  t.is(results.foods.food.length, 2);
});

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

// This runs after all tests
test.after('cleanup', (t) => {
  t.context.testPassed = true;
});

test.after.always('guaranteed cleanup', async (t) => {
  if (t.context.testPassed) {
    return;
  }
  if (IS_FAST_TEST) {
    return;
  }
  if (IS_TRAVIS_CI) {
    return;
  }
  const failedTasks = Object.entries(t.context.tasks).map(([taskName]) => {
    return taskName;
  });
  t.log('Failed: ', failedTasks);
  const { SENDGRID_API_KEY } = require('../../src/env');
  sgMail.setApiKey(SENDGRID_API_KEY);
  const msg = {
    to: maintainers[0].email,
    from: 'no-reply@gotointeractive.com',
    subject: 'ProstoDiary: 👾 E2E failed',
    text: `Failed test: ${JSON.stringify(failedTasks, null, 2)}`,
  };
  const [mailResult] = await sgMail.send(msg);
  t.true(mailResult.statusCode >= 200 && mailResult.statusCode < 300);
});
