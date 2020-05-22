const dateFns = require('date-fns');
/* TODO: переписать функции своего велосипеда на date-fns
  Заложить этот сервис в основу нового - SmartDate - https://github.com/gotois/ProstoDiary_bot/issues/90
  Таким образом, все оперирование с датами внутри проекта будет происходить через него
 */
/**
 *
 * @param {Date} date - date
 * @returns {boolean}
 */
const checkDateLaterThanNow = (date) => {
  return new Date().getTime() < date.getTime();
};
/**
 * @param {string|Date} date - date
 * @returns {boolean}
 */
const isValidDate = (date) => {
  try {
    return (
      dateFns.isValid(new Date(date)) &&
      !checkDateLaterThanNow(new Date(date)) &&
      !Number.isNaN(Date.parse(date))
    );
  } catch {
    return false;
  }
};
/**
 * @param {string|Date} date - 'YYY-MM-DD'
 * @returns {Date|Error}
 */
const convertToNormalDate = (date) => {
  if (dateFns.isDate(date)) {
    return date;
  }
  date = date.split('.').join('-');

  // todo: добавить проверку на validator.isISO8601
  // ...

  let dd;
  let mm;
  let yyyy;

  // @example: '20/07/2019'
  // eslint-disable-next-line
  if (/\d{2}\/\d{2}\/\d{4}/.test(date)) {
    if (date.includes('month/day/year')) {
      dd = Number(date.slice(3, 5));
      mm = Number(date.slice(0, 2));
      yyyy = Number(date.slice(6, 10));
    } else {
      dd = Number(date.slice(0, 2));
      mm = Number(date.slice(3, 5));
      yyyy = Number(date.slice(6, 10));
    }
    // eslint-disable-next-line
  } else if (/\d{4}-\d{1,2}-\d{1,2}/.test(date)) {
    // `YYYY-MM-DD`
    dd = Number(date.slice(8, 10));
    mm = Number(date.slice(5, 7));
    yyyy = Number(date.slice(0, 4));
  } else {
    dd = Number(date.match(/-\d+-(\d+)/)[1]);
    mm = Number(date.match(/-(\d+)/)[1]) - 1;
    yyyy = Number(date.match(/(\d+)-/)[1]);
  }
  if (dd > 31 || mm > 12) {
    throw new Error('Invalid Date day or month');
  }
  const currentDate = new Date();
  currentDate.setDate(dd);
  currentDate.setMonth(mm);
  currentDate.setYear(yyyy);
  if (!dateFns.isValid(currentDate)) {
    throw new Error('Date is invalid');
  }
  return currentDate;
};
/**
 *
 * @param {number} text - text
 * @returns {string}
 */
const convertIn2DigitFormat = (text) => {
  return `0${text}`.slice(-2);
};

module.exports = {
  isValidDate,
  convertToNormalDate,
  convertIn2DigitFormat,
  checkDateLaterThanNow,
};
