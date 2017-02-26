/**
 *
 * @param date {Date}
 * @return {boolean}
 */
function checkDateLaterThanNow(date) {
  return new Date() <= date;
}
/**
 *
 * @param date {Date}
 * @return {boolean}
 */
function dateIsIncorrect(date) {
  return isNaN(Date.parse(date));
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
  if (dateIsIncorrect(date)) {
    return false;
  }

  return true;
}
/**
 *
 * @param date {String} 01.02.2016
 * @returns {Date}
 */
function convertToNormalDate(date) {
  date = date.replace(/\./g, '-');
  const newDate = new Date();
  newDate.setDate(+date.match(/(\d+)-/)[1]);
  newDate.setMonth(+date.match(/-(\d+)/)[1] - 1);
  newDate.setYear(+date.match(/-\d+-(\d+)/)[1]);

  return newDate;
}
/**
 *
 * @param text {Number|String}
 * @returns {string}
 */
function convertIn2DigitFormat(text) {
  return ('0' + text).slice(-2);
}

module.exports = {
  isNormalDate,
  convertToNormalDate,
  convertIn2DigitFormat
};
