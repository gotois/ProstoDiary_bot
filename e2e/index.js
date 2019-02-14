import test from 'ava';

const TelegramServer = require('telegram-test-api');
const TelegramBot = require('node-telegram-bot-api');
const TestBot = require('./TestBot');

let server;
let client;

// This runs before all tests
test.before(async (t) => {
  const token = 'sampleToken';
  server = new TelegramServer({
    port: 9000,
    'host': 'localhost',
    'storage': 'RAM',
    'storeTimeout': 60
  });
  
  await server.start();
  client = server.getClient(token);
  
  let botOptions = {polling: true, baseApiUrl: server.ApiURL};
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

// This will always run, regardless of earlier failures
// test.after.always('guaranteed cleanup', t => {
// });

// This runs before each test
// test.beforeEach(t => {
// });

// This runs after each test
// test.afterEach(t => {
// this.slow(2000);
// this.timeout(10000);
// return server.stop()
// });

// This runs after each test and other test hooks, even if they failed
// test.afterEach.always(t => {
// });

test('/help', async t => {
  // this.slow(400);
  // this.timeout(800);
  let message = client.makeMessage('/help');
  await client.sendMessage(message);
  
  let updates = await client.getUpdates();
  t.truthy(updates.ok);
  // message = client.makeMessage(keyboard[0][0].text);
});

test.todo('/start');

test.todo('/dbclear');

test.todo('/download');

test.todo('/search');
