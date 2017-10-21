/**
 * @type {{salaryReceived: number, allSpent: number, allReceived: number}}
 */
const TYPES = {
  allSpent: 0,
  allReceived: 1,
};
const regExpMonthNumber = /^\d+ (?=Января|Февраля|Марта|Апреля|Мая|Июня|Июля|Августа|Сентября|Октября|Ноября|Декабря)/gi;
const regExpYear = /\d+ (?=Понедельник|Вторник|Среда|Четверг|Пятница|Суббота|Воскресенье)/gi;
const regExpWeight = /вес.\d+(,|\.).+/gim;
const regExpNumbers = /^.+ ?(\d+)/gim;
const regExpMyZP = /(зп|зарплата|получил|получено|заработано|заработал)(\s?)+\d|\$|€/gim;

const onlyNumberString = 'A-Za-z0-9_.,';
const rublesString = ' рублей|рублей|рублей | руб|руб|руб | р|р|р | ₽|₽|₽ | rub|rub|rub ';
const regExpRubles = new RegExp(rublesString);
const euroString = ' евро|евро| €|€|€ ';
const regExpEuro = new RegExp(euroString);
const usdString = ' долларов|долларов|долларов | доллар|доллар|доллар | dollars|dollars|dollars |\\$';
const regExpUsd = new RegExp(usdString);

const [EUR, RUB, USD] = ['eur', 'rub', 'usd',];
const defaultOut = Object.freeze({[EUR]: 0, [RUB]: 0, [USD]: 0,});
/**
 * @param text {String}
 * @return {Array}
 */
const splitText = text => (typeof text === 'string' ? text.split('\n') : []);
/**
 * Локализуем
 * @param money {Object}
 * @returns {String}
 */
const getFormatMoney = (money) => {
  const CURRENCY = 'currency';
  return {
    [EUR]: new Intl
      .NumberFormat('de-DE', {
        'style': CURRENCY,
        'currency': 'EUR',
        'minimumFractionDigits': 2,
        'maximumFractionDigits': 2,
      })
      .format(money[EUR]),
    [RUB]: new Intl
      .NumberFormat('ru-RU', {
        'style': CURRENCY,
        'currency': 'RUB',
        'minimumFractionDigits': 2,
        'maximumFractionDigits': 2,
      })
      .format(money[RUB]),
    [USD]: new Intl
      .NumberFormat('en-US', {
        'style': CURRENCY,
        'currency': 'USD',
        'minimumFractionDigits': 2,
        'maximumFractionDigits': 2,
      })
      .format(money[USD]),
  };
};
/**
 * @param texts {Array}
 * @param type {Number}
 * @return {Object}
 */
const getMoney = ({texts, type,}) => {
  if (!Array.isArray(texts)) {
    throw 'Not valid argument';
  }
  if (texts.length) {
    return texts
      .reduce((acc, raw) => acc.concat(...splitText(raw)), [])
      .map(text => formatType(text, type))
      .map(text => calcMoney(text))
      .reduce((acc, money) => {
        acc[EUR] += money.eur;
        acc[RUB] += money.rub;
        acc[USD] += money.usd;
        return acc;
      }, Object.assign({}, defaultOut));
  } else {
    return defaultOut;
  }
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
  // Удаляем знак + чтобы не было рекурсивного обхода регулярки
  str = str.replace(/\+/, '');

  switch (type) {
    // Удаляем строчку о зарплате и прочих получениях
    case TYPES.allSpent: {
      if (str.match(regExpMyZP)) {
        str = '';
      }
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
 * @returns {Object}
 */
const calcMoney = (str) => {
  if (str.length <= 1) {
    return defaultOut;
  }
  // TODO: ничего не находит в случае когда str === '$100'
  // явно объявляю доллары
  str = str.replace(/\$.+/, (str) => {
    return str.substr(1) + 'долларов';
  });

  const numbers = str.match(str.match(regExpNumbers));
  if (!(numbers && numbers.length)) {
    return defaultOut;
  }
  return splitText(numbers.input)
    .reduce((acc, text) => {
      const money = getAllSum(text);
      acc[RUB] += money.rub;
      acc[EUR] += money.eur;
      acc[USD] += money.usd;
      return acc;
    }, Object.assign({}, defaultOut));
};
/**
 * @param str {String}
 * @return {number}
 */
const cleanDirtyNumberString = (str) => {
  const [val] = str
    .replace(regExpEuro, '')
    .replace(regExpUsd, '')
    .replace(regExpRubles, '')
    .replace(/\.$/, '')
    .match(/\d+$|\d+\.\d+/, '') || [0];
  return Number.parseFloat(val);
};
/**
 * @param numbers {String}
 * @returns {Object}
 */
const getAllSum = (numbers) => {
  let out = numbers.replace(/^\D+/, '');
  out = out.replace(/к/i, () => '000');
  // TODO: не обрабатывается случай `Игра престолов 1серия` => добавляется 1
  // Отсеивание int+float значений
  if (out.match(/^\d\.?(\d\d)?/) > '0') {
    const regexp = new RegExp(
      '[^' + onlyNumberString + rublesString + euroString + usdString + ']', 'gim'
    );
    const outArray = out
      .replace(regexp, ',')
      // числа без знаков становятся рублями
      .replace(/\d+\.?(\d\d)?(\s|$)/, (str, arg2, arg3, index, all) => {
        const start = index + str.length;
        const end = index + 6 + str.length;
        const nextStr = all.substr(start, end);
        if (regExpUsd.test(nextStr)) {
          return str.trimRight() + 'долларов ';
        } else if(regExpEuro.test(nextStr)) {
          return str.trimRight() + 'евро ';
        } else {
          return str.trimRight() + 'рублей ';
        }
      })
      .replace(/\s/g, ',')
      .split(',');
    return outArray
      .filter(temp => {
        if (!temp.length || !(/\d/.test(temp)) /*|| Number.isNaN(Number(temp))*/) {
          return false;
        }
        return true;
      })
      .reduce((acc, str) => {
        if (regExpUsd.test(str)) {
          acc[USD] += cleanDirtyNumberString(str);
        } else if(regExpEuro.test(str)) {
          acc[EUR] += cleanDirtyNumberString(str);
        } else {
          acc[RUB] += cleanDirtyNumberString(str);
        }
        return acc;
      }, Object.assign({}, defaultOut));
  } else {
    return defaultOut;
  }
};

module.exports = {
  getMoney,
  getFormatMoney,
  TYPES,
};
