/**
 *
 * @param date {Date}
 * @return {boolean}
 */
function checkDateLaterThanNow(date) {
  return ((new Date()).getTime() < (date).getTime());
}
/**
 *
 * @param date {Date|String}
 * @return {boolean}
 */
function dateIsIncorrect(date) {
  return (isNaN((Date).parse(date)));
}
/**
 *
 * @param date {String|Date}
 * @return {boolean}
 */
function isNormalDate(date) {
  if (checkDateLaterThanNow(new Date(date))) {
    return false;
  }
  //noinspection RedundantIfStatementJS
  if (dateIsIncorrect(date)) {
    return false;
  }

  return true;
}
/**
 * @example convertToNormalDate('01.02.2016')
 * @param date {String|Date}
 * @returns {Date}
 */
function convertToNormalDate(date) {
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
}
/**
 *
 * @param text {Number|String}
 * @returns {string}
 */
function convertIn2DigitFormat(text) {
  return (`0${text}`).slice(-2);
}

/**
 * @param {Date|String} date
 * @return {boolean}
 */
function isDate(date) {
  return (date instanceof Date || typeof date === 'string');
}
/**
 *
 * @param fromDate
 * @param untilDate
 * @return {number}
 */
function getDifferenceDays(fromDate, untilDate) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  const differenceDays = Math.floor((untilDate - fromDate) / (_MS_PER_DAY));
  if (differenceDays < 0) {
    throw new Error('until less from');
  }

  return differenceDays;
}
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
function fillRangeTimes(from, until) {
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
}

module.exports = {
  isNormalDate,
  fillRangeTimes,
  convertToNormalDate,
  convertIn2DigitFormat,
  checkDateLaterThanNow,
};
