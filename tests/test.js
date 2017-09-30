//noinspection Eslint
import test from 'ava';
process.env.SALT_PASSWORD = '123456';
process.env.NODE_ENV = 'production';
process.env.TOKEN = '123456';

test('database config', t => {
  const dbConfig = require('../src/config/database.config');
  t.is(typeof dbConfig, 'object');
});

test('crypto', t => {
  const crypt = require('../src/services/crypt.service');
  const eWord = crypt.encode('Something What?');
  const dWord = crypt.decode(eWord);
  t.is(dWord, 'Something What?');
});

test('commands', t => {
  const commands = require('../src/commands/bot.commands');
  t.true(commands.DOWNLOAD instanceof RegExp);
  t.true(commands.DBCLEAR instanceof RegExp);
  t.true(commands.START instanceof RegExp);
  t.true(commands.HELP instanceof RegExp);
  t.true(commands.GETDATE instanceof RegExp);
  t.true(commands.SETDATE instanceof RegExp);
  t.true(commands.GRAPH instanceof RegExp);
  t.true(commands.COUNT instanceof RegExp);
  t.true(typeof commands.EDITED_MESSAGE_TEXT === 'string');
  t.true(typeof commands.TEXT === 'string');
});

test('datetime', t => {
  const {
    isNormalDate, convertToNormalDate, checkDateLaterThanNow, fillRangeTimes
  } = require('../src/services/date.service');
  // isNormalDate
  {
    t.true(isNormalDate('1.1.2016'));
    t.true(isNormalDate('01.01.2016'));
    t.false(isNormalDate('13.13.2016'));
    t.false(isNormalDate('31.13.2017'));
    t.false(isNormalDate('32.12.2017'));
    t.true(isNormalDate(123));
  }
  // convertToNormalDate
  {
    t.is(typeof convertToNormalDate('3-12-2016'), 'object');
    t.true(convertToNormalDate('3-12-2016') instanceof Date);
    t.is(convertToNormalDate('01.02.2016').getYear(), 116);
    t.is(convertToNormalDate('08.07.2017').getDay(), 6);
    t.is(convertToNormalDate('07.08.2017').getDay(), 1);
    t.is(convertToNormalDate('07-08-2017').getDay(), 1);
    t.is(convertToNormalDate('2.27.2017').getDay(), 4);
    t.is(convertToNormalDate(new Date(0)).getMonth(), 0);
    t.is(convertToNormalDate(new Date(0)).toDateString(), 'Thu Jan 01 1970');
    t.true(convertToNormalDate(new Date()) instanceof Date);
  }
  // checkDateLaterThanNow
  {
    t.false(checkDateLaterThanNow(new Date(0)));
    t.false(checkDateLaterThanNow(new Date('07.12.2016')));
    t.false(checkDateLaterThanNow(new Date('31.12.2001')));
    t.false(checkDateLaterThanNow(new Date('32.12.2016')));
    t.false(checkDateLaterThanNow(new Date()));
  }
  // fillRangeTimes
  {
    t.is(fillRangeTimes('01.01.1971', '01.05.1971').length, 5);
    t.is(fillRangeTimes(new Date('01.01.1971'), new Date('01.05.1971')).length, 5);
  }
});

test('session', t => {
  const session = require('../src/services/session.service');
  t.is(typeof session.getSession(123), 'object');
  t.is(typeof session.getSession(123).id, 'number');
});

test('money', t => {
  const {getMoney, TYPES} = require('../src/services/calc.service');

  // Spent
  {
    t.is(getMoney({
      texts: ['Поел 300', '+ ЗП 1'],
      type: TYPES.allSpent,
    }), 300);
    t.is(getMoney({
      texts: ['Поел 100р', 'Магаз 100.2₽', 'Магаз 100р.', 'Магазин 20.11р'],
      type: TYPES.allSpent,
    }), 320.31);
    t.is(getMoney({
      texts: ['Поел 0.1р', 'some 0.1₽', 'some x 0.112', 'еще 0.1 \n и еще 0.1'],
      type: TYPES.allSpent,
    }), 0.51);
    t.is(getMoney({
      texts: ['Поел 300', 'Магазин 100', 'Зп 999'],
      type: TYPES.allSpent,
    }), 400);
    t.is(getMoney({
      texts: ['+ ЗП 300'],
      type: TYPES.allSpent,
    }), 0);
    t.is(getMoney({
      texts: ['что-то отправил 300рублей ', 'Поел джаганнат за 200', 'получил 100р'],
      type: TYPES.allSpent,
    }), 500);
    t.is(getMoney({
      texts: ['поел 300 100р 100'],
      type: TYPES.allSpent,
    }), 500);
  }
  // received
  {
    t.is(getMoney({
      texts: ['ЗП 300рублей ', 'зп 200 рублей', 'зарплата 100руб', 'получил 100', 'Водка 50'],
      type: TYPES.allReceived,
    }), 700);
    t.is(getMoney({
      texts: ['ЗП 5\n ЗП 5'],
      type: TYPES.allReceived,
    }), 10);
  }
});

test('graph service', t => {
  const {getImage, getImageBuffer, deletePlot} = require('../src/services/graph.service');
  t.true(typeof getImage === 'function');
  t.true(typeof getImageBuffer === 'function');
  t.true(typeof deletePlot === 'function');
});

test('graph controller', t => {
  const {formatWord, createRegExp, isRegexString, createRegexInput, convertStringToRegexp} = require('../src/events/graph.controller');
  // formatWord
  {
    t.true(typeof formatWord('lksdjf') === 'string');
    t.is(formatWord('/'), '\\/');
    t.is(formatWord('|'), '\\|');
  }
  // createRegExp
  {
    t.true(createRegExp('something') instanceof RegExp);
    t.true(createRegexInput('читал').test('Работал читал \nБухал'));
    t.true(createRegexInput('Работал').test('Работал читал \nБухал'));
    t.true(createRegexInput('бухал').test('Работал читал \nБухал'));
  }
  // isRegexString
  {
    t.true(isRegexString('/something/'));
    t.false(isRegexString('/something'));
    t.false(isRegexString('something/'));
  }
});

test('format', t => {
  const {prevInput, formatRows} = require('../src/services/format.service');
  // prevInput
  {
    t.is(prevInput('Some'), '✓Some…');
    t.is(prevInput('123456789'), '✓123456…');
  }
  // formatRows
  {
    t.is(formatRows([{
      date_added: new Date(0),
      entry: ('qqq')
    }]), '01.01.1970\nqqq');
    t.is(formatRows([{
      date_added: new Date(0),
      entry: '+++'
    }]), '01.01.1970\n+++');
    t.is(formatRows([{
      date_added: new Date('01.01.1991'),
      entry: 'some1'
    }, {
      date_added: new Date('01.01.1992'),
      entry: 'some2'
    }]), '01.01.1991\nsome1\n\n01.01.1992\nsome2');
  }

});
