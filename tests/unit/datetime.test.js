module.exports = (t) => {
  const {
    isValidDate,
    convertToNormalDate,
    checkDateLaterThanNow,
  } = require('../../src/services/date.service');
  // isValidDate
  t.true(isValidDate('1.1.2016'));
  t.true(isValidDate('01.01.2016'));
  t.false(isValidDate('13.13.2016'));
  t.false(isValidDate('31.13.2017'));
  t.false(isValidDate('32.12.2017'));

  // convertToNormalDate
  t.is(typeof convertToNormalDate('2016-12-3'), 'object');
  t.true(convertToNormalDate('2016-3-12') instanceof Date);
  t.true(convertToNormalDate('13/07/2019') instanceof Date);
  t.is(convertToNormalDate('2016-01.02').getFullYear(), 2016);
  t.is(convertToNormalDate('2017-07-08').getDate(), 8);
  t.is(convertToNormalDate('2017-08-07').getDate(), 7);
  t.is(convertToNormalDate('2017-08-07').getMonth(), 8);
  t.throws(() => {
    convertToNormalDate('2017-27-2');
  }, { instanceOf: Error });
  t.is(convertToNormalDate(new Date(0)).getMonth(), 0);
  t.is(convertToNormalDate(new Date(0)).toDateString(), 'Thu Jan 01 1970');
  t.true(convertToNormalDate(new Date()) instanceof Date);

  // checkDateLaterThanNow
  t.false(checkDateLaterThanNow(new Date(0)));
  t.false(checkDateLaterThanNow(new Date('07.12.2016')));
  t.false(checkDateLaterThanNow(new Date('31.12.2001')));
  t.false(checkDateLaterThanNow(new Date('32.12.2016')));
  t.false(checkDateLaterThanNow(new Date()));
};
