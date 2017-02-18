function checkDateLaterThanNow(date) {
  return new Date() <= date;
}

function dateIsIncorrect(date) {
  return isNaN(Date.parse(date))
}

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

module.exports = {
  isNormalDate,
  convertToNormalDate
};
