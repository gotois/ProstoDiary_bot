/**
 *
 * @type {number}
 */
const MS_PER_DAY = 1000 * 60 * 60 * 24;
/**
 *
 * @param date {Date}
 * @return {boolean}
 */
const checkDateLaterThanNow = date => ((new Date()).getTime() < (date).getTime());
/**
 *
 * @param date {Date|String}
 * @return {boolean}
 */
const dateIsIncorrect = date => (isNaN((Date).parse(date)));
/**
 *
 * @param date {String|Date}
 * @return {boolean}
 */
const isNormalDate = date => {
  if (checkDateLaterThanNow(new Date(date))) {
    return false;
  }
  //noinspection RedundantIfStatementJS
  if (dateIsIncorrect(date)) {
    return false;
  }
  return true;
};
/**
 * @example convertToNormalDate('01.02.2016')
 * @param date {String|Date}
 * @returns {Date}
 */
const convertToNormalDate = date => {
  if (date instanceof Date) {
    return date;
  } else {
    date = date.replace(/\./g, '-');
    const newDate = new Date();
    newDate.setDate(+(date.match(/(\d+)-/)[1]));
    newDate.setMonth(+(date.match(/-(\d+)/)[1]) - 1);
    newDate.setYear(+(date.match(/-\d+-(\d+)/)[1]));
    return newDate;
  }
};
/**
 *
 * @param text {Number|String}
 * @returns {string}
 */
const convertIn2DigitFormat = text => ((`0${text}`).slice(-2));
/**
 * @param {Date|String} date
 * @return {boolean}
 */
const isDate = date => (date instanceof Date || typeof date === 'string');
/**
 *
 * @param fromDate
 * @param untilDate
 * @return {number}
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
 * @desc Эта функция заполняет датами пустоты во времени
 * @param from {String|Date}
 * @param until {String|Date}
 * @return {Array}
 * @link https://gist.github.com/qertis/c1ed54a5f7cbaa9709030c0ff14d5b9e
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
