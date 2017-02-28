//noinspection Eslint
import test from 'ava';

test('bot config', t => {
  const botConfig = require('../src/config/bot.config.js');
  t.true(botConfig instanceof Object);
});

test('database config', t => {
  const dbConfig = require('../src/config/database.config.js');
  t.is(typeof dbConfig, 'object');
});

test('crypto', t => {
  process.env.SALT_PASSWORD = '123456';
  const crypt = require('../src/crypt');
  const eword = crypt.encode('Something What?');
  const dword = crypt.decode(eword);
  t.is(dword, 'Something What?');
});

test('commands', t => {
  const commands = require('../src/bot.commands');
  t.true(commands.DOWNLOAD instanceof RegExp);
  t.true(commands.DBCLEAR instanceof RegExp);
  t.true(commands.DBCLEAR instanceof RegExp);
  t.true(commands.START instanceof RegExp);
  t.true(commands.HELP instanceof RegExp);
  t.true(commands.GETDATE instanceof RegExp);
  t.true(commands.SETDATE instanceof RegExp);
});

test('datetime', t => {
  const datetime = require('../src/datetime');
  t.is(datetime.isNormalDate('1.1.2016'), true);
  t.is(datetime.isNormalDate('01.01.2016'), true);
  t.is(datetime.isNormalDate('13.13.2016'), false);
  t.is(datetime.isNormalDate(123), true);
  t.is(typeof datetime.convertToNormalDate('3-12-2016'), 'object');
  t.true(datetime.convertToNormalDate('3-12-2016') instanceof Date);
});

test('session', t => {
  const session = require('../src/sessions');
  t.is(typeof session.getSession(123), 'object');
  t.is(typeof session.getSession(123).id, 'number');
});
