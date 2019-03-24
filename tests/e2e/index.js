import test from 'ava';

// Simple Heroku Detect
if (!process.env.PORT) {
  require('dotenv').config();
}
const { maintainers } = require('../../package');
const TelegramServer = require('telegram-test-api');
const TelegramBot = require('node-telegram-bot-api');
const sgMail = require('@sendgrid/mail');
const TestBot = require('./TestBot');

let tasks = {};
let server;
let client;

// This runs before all tests
test.before(async (t) => {
  const token = 'sampleToken';
  server = new TelegramServer({
    port: 9000,
    host: 'localhost',
    storage: 'RAM',
    storeTimeout: 60,
  });

  await server.start();
  client = server.getClient(token);

  let botOptions = { polling: true, baseApiUrl: server.ApiURL };
  const telegramBot = new TelegramBot(token, botOptions);
  new TestBot(telegramBot);
  t.pass();
});

// This runs after the above and before tests
// test.serial.before(t => {
// });

// This runs after all tests
// test.after('cleanup', t => {
// });

test.beforeEach((t) => {
  const startedTestTitle = t.title.replace('beforeEach hook for ', '');
  tasks[startedTestTitle] = startedTestTitle;
});

test.afterEach((t) => {
  const successTestTitle = t.title.replace('afterEach hook for ', '');
  delete tasks[successTestTitle];
});

/* This runs after each test
test.afterEach(t => {
  this.slow(2000);
  this.timeout(10000);
  return server.stop()
});
*/

// This runs after each test and other test hooks, even if they failed
// test.afterEach.always(t => {
// });

test('/help', async (t) => {
  // this.slow(400);
  // this.timeout(800);
  let message = client.makeMessage('/help');
  await client.sendMessage(message);

  let updates = await client.getUpdates();
  t.truthy(updates.ok);
  // message = client.makeMessage(keyboard[0][0].text);
});

// skip test for travis CI
if (process.env.CI !== 'TRAVIS') {
  test('fatsecret', async (t) => {
    t.timeout(1000);
    const foodService = require('../../src/services/food.service');
    const results = await foodService.search('Soup', 2);
    t.true(Array.isArray(results.foods.food));
    t.is(results.foods.food.length, 2);
  });
}

test.todo('/start');

test.todo('/dbclear');

test.todo('/download');

test.todo('/search');

// This runs after all tests
test.after('cleanup', (t) => {
  t.context.testPassed = true;
});

test.after.always('guaranteed cleanup', async (t) => {
  if (t.context.testPassed) {
    return;
  }
  if (process.env.SENDGRID_API_KEY) {
    const failedTasks = Object.entries(tasks).map(([taskName]) => {
      return taskName;
    });
    t.log('Failed: ', failedTasks);

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: maintainers[0].email,
      from: 'no-reply@gotointeractive.com',
      subject: 'ProstoDiary: 👾 E2E failed',
      text: `Failed test: ${JSON.stringify(failedTasks, null, 2)}`,
    };
    const [mailResult] = await sgMail.send(msg);
    t.true(mailResult.statusCode >= 200 && mailResult.statusCode < 300);
  }
});
