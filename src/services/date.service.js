/**
 * @constant
 * @type {number}
 */
const MS_PER_DAY = 1000 * 60 * 60 * 24;
/**
 *
 * @param {Date} date - date
 * @returns {boolean}
 */
const checkDateLaterThanNow = (date) => ((new Date()).getTime() < (date).getTime());
/**
 *
 * @param {Date|string} date - date
 * @returns {boolean}
 */
const dateIsIncorrect = (date) => (isNaN((Date).parse(date)));
/**
 *
 * @param {string|Date} date - date
 * @returns {boolean}
 */
const isNormalDate = date => {
  //noinspection RedundantIfStatementJS
  if (checkDateLaterThanNow(new Date(date)) || dateIsIncorrect(date)) {
    return false;
  }
  return true;
};
/**
 * @example convertToNormalDate('YYY-MM-DD')
 * @param {string|Date} date - date
 * @returns {Date}
 */
const convertToNormalDate = date => {
  if (date instanceof Date) {
    return date;
  } else {
    date = date.split('.').join('-');

    const dd = Number(date.match(/-\d+-(\d+)/)[1]);
    const mm = Number(date.match(/-(\d+)/)[1]) - 1;
    const yyyy = Number(date.match(/(\d+)-/)[1]);

    if (dd > 31 || mm > 12) {
      throw new Error('Invalid Date');
    }
    const newDate = new Date();
    newDate.setDate(dd);
    newDate.setMonth(mm);
    newDate.setYear(yyyy);
    return newDate;
  }
};
/**
 *
 * @param {number} text - text
 * @returns {string}
 */
const convertIn2DigitFormat = text => ((`0${text}`).slice(-2));
/**
 * @param {Date|string} date - date
 * @returns {boolean}
 */
const isDate = date => (date instanceof Date || typeof date === 'string');
/**
 *
 * @param {Date} fromDate - from date
 * @param {Date} untilDate - until date
 * @returns {number}
 */
const getDifferenceDays = (fromDate, untilDate) => {
  const differenceDays = Math.floor((untilDate - fromDate) / (MS_PER_DAY));
  if (differenceDays < 0) {
    throw new Error('until less from');
  }
  return differenceDays;
};
/**
 * Например если есть "2016-05-01" и "2016-05-03" то автоматически создаются
 * ["2016-05-01", "2016-05-02", "2016-05-03"]
 *
 * @description Эта функция заполняет датами пустоты во времени
 * @param {string|Date} from - from date
 * @param {string|Date} until - until date
 * @returns {Array}
 * {@link https://gist.github.com/qertis/c1ed54a5f7cbaa9709030c0ff14d5b9e}
 * @example fillRangeTimes('2015-01-01', "2016-03-02");
 */
const fillRangeTimes = (from, until) => {
  if (!(isDate(from) && isDate(until))) {
    throw new Error('unknown param type');
  }
  const result = [];
  const fromDate = new Date(from);
  const untilDate = new Date(until);
  const dayOffLength = getDifferenceDays(fromDate, untilDate);
  for (let i = 0; i < dayOffLength; i++) {
    const date = new Date(fromDate);
    date.setDate(fromDate.getDate() + i);
    fromDate.setHours(0);
    fromDate.setMinutes(0);
    fromDate.setMinutes(0);
    result.push(date);
  }
  result.push(untilDate);
  return result;
};

module.exports = {
  isNormalDate,
  fillRangeTimes,
  convertToNormalDate,
  convertIn2DigitFormat,
  checkDateLaterThanNow,
};
