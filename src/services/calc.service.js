/**
 * @type {{salaryReceived: number, allSpent: number, allReceived: number}}
 */
const TYPES = {
  allSpent: 0,
  allReceived: 1,
};
const regExpMonthNumber = /^\d+ (?=Января|Февраля|Марта|Апреля|Мая|Июня|Июля|Августа|Сентября|Октября|Ноября|Декабря)/gi;
const regExpYear = /\d+ (?=Понедельник|Вторник|Среда|Четверг|Пятница|Суббота|Воскресенье)/gi;
const regExpWeight = /вес.\d+(,|\.).+/gi;
const regExpNumbers = /^.+ (\d+)/gi;
const regExpRubles = /р|руб|₽| р| ₽| руб| рублей/i;
const regExpMyZP = /(зп|зарплата|получил|получено|заработано|заработал)(\s?)+\d/gi;

/**
 * @param text {String}
 * @return {Array}
 */
const splitText = text => text.split('\n');
/**
 *
 * @param texts {Array}
 * @param local {String}
 * @param type {Number}
 * @return {String}
 */
const getMoney = ({texts, type, local}) => {
  /**
   * @return {Number}
   */
  const allSpentMoney = (() => {
    if (texts.length) {
      return texts
        .map(text => formatType(text, type))
        .map(text => calcMoney(text))
        .reduce((acc, money) => acc + money);
    } else {
      return 0;
    }
  })();
  switch (local) {
    case 'RUB': {
      return getSumRub(allSpentMoney);
    }
    default: {
      return allSpentMoney;
    }
  }
};
/**
 * Локализуем сумму в рублях
 * @param money {Number}
 * @returns {String}
 */
const getSumRub = money => {
  const options = {style: 'currency', currency: 'RUB'};
  const numberFormat = new Intl.NumberFormat('ru-RU', options);
  return numberFormat.format(money);
};
/**
 * @param str {String}
 * @param type {Number}
 * @returns {number}
 */
const formatType = (str, type) => {
  str = str.trim();
  // Находим число месяца и удаляем из поиска строчку число месяца
  str = str.replace(regExpMonthNumber, '');
  // Находим год и удаляем строчку о найденном годе
  str = str.replace(regExpYear, '');
  // Находим вес и удаляем строчку о своем весе
  str = str.replace(regExpWeight, '');
  switch (type) {
    // Удаляем строчку о зарплате и прочих получениях
    case TYPES.allSpent: {
      str = str.replace(regExpMyZP, '');
      break;
    }
    // Находим потраченное
    case TYPES.allReceived: {
      if (!str.match(regExpMyZP)) {
        str = '';
      }
      break;
    }
    default: {
      console.warn('Unknown type');
    }
  }
  return str;
};
/**
 * @param str {String}
 * @returns {number}
 */
const calcMoney = (str) => {
  if (str.length <= 1) {
    return 0;
  }
  const numbers = str.match(str.match(regExpNumbers));
  if (!numbers) {
    return 0;
  }
  return splitText(numbers.input).reduce((acc, text) => {
    acc += getAllSum(text);
    return acc;
  }, 0);
};
/**
 * @param numbers {String}
 * @returns {number}
 */
const getAllSum = (numbers) => {
  let daySpentMoney = 0.0;
  let out = numbers.replace(/^\D+/, '');
  out = out.replace(regExpRubles, '');
  out = out.replace(/к/i, () => '000');
  if (out.match(/^\d/) > '0') {
    out = out.replace(/\W/gi, '');
    out = Number.parseFloat(out);
    daySpentMoney += out;
  }
  return daySpentMoney;
};

module.exports = {
  getMoney,
  TYPES,
};
