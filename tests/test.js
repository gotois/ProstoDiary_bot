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
  const {
    DOWNLOAD,
    DBCLEAR,
    START,
    HELP,
    GETDATE,
    SETDATE,
    GRAPH,
    COUNT,
    SEARCH,
    EDITED_MESSAGE_TEXT,
    TEXT,
  } = commands;

  t.true(DOWNLOAD instanceof RegExp);
  t.true(DBCLEAR instanceof RegExp);
  t.true(START instanceof RegExp);
  t.true(HELP instanceof RegExp);
  t.true(GETDATE instanceof RegExp);
  t.true(SETDATE instanceof RegExp);
  t.true(GRAPH instanceof RegExp);
  t.true(COUNT instanceof RegExp);
  t.true(SEARCH instanceof RegExp);
  t.true(typeof EDITED_MESSAGE_TEXT === 'string');
  t.true(typeof TEXT === 'string');

  {
    t.true(DOWNLOAD.test('/download'));
    t.false(DOWNLOAD.test('/download 1'));
  }
  {
    t.true(DBCLEAR.test('/dbclear'));
    t.false(DBCLEAR.test('/dbclear/'));
  }
  {
    t.true(COUNT.test('/count'));
    t.true(COUNT.test('/count +'));
    t.true(COUNT.test('/count -'));
    t.false(COUNT.test('/count/'));
  }
  {
    t.true(SEARCH.test('/search something'));
  }
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
    t.is(convertToNormalDate('01.02.2016').getFullYear(), 2016);
    t.is(convertToNormalDate('08.07.2017').getDate(), 8);
    t.is(convertToNormalDate('07.08.2017').getDate(), 7);
    t.is(convertToNormalDate('07-08-2017').getMonth(), 7);
    const error = t.throws(() => {
      convertToNormalDate('2.27.2017');
    }, Error);
    t.is(error.message, 'Invalid Date');
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
      texts: [1, 2, '0', 'sdlfjsdlfjsldkfj'],
      type: TYPES.allSpent,
    }), 0);
    t.is(getMoney({
      texts: ['Поел 300 рыбу', '+ ЗП 1 \n\nsad', 'nuff said'],
      type: TYPES.allSpent,
    }), 300);
    t.is(getMoney({
      texts: ['Поел мясо 100р', 'Магаз 100.20₽', 'Магаз 100р.', '20.11р магазин'],
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
      texts: ['+ ЗП 300', 'что-то еще'],
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
  const {formatWord, createRegExp, isRegexString, createRegexInput} = require('../src/services/input.service');
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
