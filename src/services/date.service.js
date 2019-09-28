const dateFns = require('date-fns');
/* TODO: переписать функции своего велосипеда на date-fns
  Заложить этот сервис в основу нового - SmartDate - https://github.com/gotois/ProstoDiary_bot/issues/90
  Таким образом, все оперирование с датами внутри проекта будет происходить через него
 */
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
      !isNaN(Date.parse(date))
    );
  } catch (_) {
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
  } else {
    dd = Number(date.match(/-\d+-(\d+)/)[1]);
    mm = Number(date.match(/-(\d+)/)[1]) - 1;
    yyyy = Number(date.match(/(\d+)-/)[1]);
  }
  if (dd > 31 || mm > 12) {
    throw new Error('Invalid Date day or month');
  }
  const newDate = new Date();
  newDate.setDate(dd);
  newDate.setMonth(mm);
  newDate.setYear(yyyy);
  if (!dateFns.isValid(newDate)) {
    throw new Error('Date is invalid');
  }
  return newDate;
};
/**
 *
 * @param {number} text - text
 * @returns {string}
 */
const convertIn2DigitFormat = (text) => {
  return `0${text}`.slice(-2);
};
/**
 *
 * @param {Date} fromDate - from date
 * @param {Date} untilDate - until date
 * @returns {number}
 */
const getDifferenceDays = (fromDate, untilDate) => {
  const differenceDays = Math.floor((untilDate - fromDate) / MS_PER_DAY);
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
 * fillRangeTimes('2015-01-01', "2016-03-02");
 */
const fillRangeTimes = (from, until) => {
  const fromDate = new Date(from);
  const untilDate = new Date(until);
  if (!(dateFns.isValid(fromDate) && dateFns.isValid(untilDate))) {
    throw new Error('unknown param type');
  }
  const result = [];
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
  isValidDate,
  fillRangeTimes,
  convertToNormalDate,
  convertIn2DigitFormat,
  checkDateLaterThanNow,
};
