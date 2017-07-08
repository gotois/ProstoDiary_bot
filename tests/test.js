//noinspection Eslint
import test from 'ava';

test('bot config', t => {
  const botConfig = require('../src/config/bot.config');
  t.true(botConfig instanceof Object);
});

test('database config', t => {
  const dbConfig = require('../src/config/database.config');
  t.is(typeof dbConfig, 'object');
});

test('crypto', t => {
  process.env.SALT_PASSWORD = '123456';
  const crypt = require('../src/services/crypt');
  const eWord = crypt.encode('Something What?');
  const dWord = crypt.decode(eWord);
  t.is(dWord, 'Something What?');
});

test('commands', t => {
  const commands = require('../src/commands/bot.commands');
  t.true(commands.DOWNLOAD instanceof RegExp);
  t.true(commands.DBCLEAR instanceof RegExp);
  t.true(commands.DBCLEAR instanceof RegExp);
  t.true(commands.START instanceof RegExp);
  t.true(commands.HELP instanceof RegExp);
  t.true(commands.GETDATE instanceof RegExp);
  t.true(commands.SETDATE instanceof RegExp);
});

test('datetime', t => {
  const datetime = require('../src/services/datetime');
  // isNormalDate
  {
    t.is(datetime.isNormalDate('1.1.2016'), true);
    t.is(datetime.isNormalDate('01.01.2016'), true);
    t.is(datetime.isNormalDate('13.13.2016'), false);
    t.is(datetime.isNormalDate(123), true);
  }
  // convertToNormalDate
  {
    t.is(typeof datetime.convertToNormalDate('3-12-2016'), 'object');
    t.true(datetime.convertToNormalDate('3-12-2016') instanceof Date);
    t.is(datetime.convertToNormalDate('01.02.2016').getYear(), 116);
    t.is(datetime.convertToNormalDate('08.07.2017').getDay(), 6);
    t.is(datetime.convertToNormalDate('07.08.2017').getDay(), 1);
    t.is(datetime.convertToNormalDate('07-08-2017').getDay(), 1);
    t.is(datetime.convertToNormalDate('2.27.2017').getDay(), 4);
    t.is(datetime.convertToNormalDate(new Date(0)).getMonth(), 0);
    t.is(datetime.convertToNormalDate(new Date(0)).toDateString(), 'Thu Jan 01 1970');
    t.true(datetime.convertToNormalDate(new Date()) instanceof Date);
  }
  // checkDateLaterThanNow
  {
    t.false(datetime.checkDateLaterThanNow(new Date(0)));
    t.false(datetime.checkDateLaterThanNow(new Date('07.12.2016')));
    t.false(datetime.checkDateLaterThanNow(new Date()));
  }
});

test('session', t => {
  const session = require('../src/services/sessions');
  t.is(typeof session.getSession(123), 'object');
  t.is(typeof session.getSession(123).id, 'number');
});

test('money', t => {
  const spentMoney = require('../src/services/spent_money');
  t.is(spentMoney(['Поел 300']), 300);
  t.is(spentMoney(['Поел 100р', 'Магаз 100₽', 'Магаз 100р.']), 300);
  t.is(spentMoney(['Поел 300', 'Магазин 100']), 400);
  t.is(spentMoney(['ЗП 300']), 0);
});
