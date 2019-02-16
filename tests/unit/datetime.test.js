module.exports = t => {
  const {
    isNormalDate,
    convertToNormalDate,
    checkDateLaterThanNow,
    fillRangeTimes,
  } = require('../../src/services/date.service');
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
    t.is(typeof convertToNormalDate('2016-12-3'), 'object');
    t.true(convertToNormalDate('2016-3-12') instanceof Date);
    t.is(convertToNormalDate('2016-01.02').getFullYear(), 2016);
    t.is(convertToNormalDate('2017-07-08').getDate(), 8);
    t.is(convertToNormalDate('2017-08-07').getDate(), 7);
    t.is(convertToNormalDate('2017-08-07').getMonth(), 7);
    const error = t.throws(() => {
      convertToNormalDate('2017-27-2');
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
};
