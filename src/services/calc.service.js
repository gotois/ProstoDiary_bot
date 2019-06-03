const { CURRENCIES } = require('./currency.service');
const { EUR, RUB, USD } = CURRENCIES;
/**
 * @constant
 * @type {{allSpent: number, allReceived: number}}
 */
const TYPES = {
  allSpent: 0,
  allReceived: 1,
};
const regExpMonthNumber = /^\d+ (?=Января|Февраля|Марта|Апреля|Мая|Июня|Июля|Августа|Сентября|Октября|Ноября|Декабря)/gi;
const regExpYear = /\d+ (?=Понедельник|Вторник|Среда|Четверг|Пятница|Суббота|Воскресенье)/gi;
const regExpWeight = /вес.\d+(,|\.).+/gim;
const regExpNumbers = /^.+ ?(\d+)/gim;
const regExpMyZP = /(дивиденды|кэшбэк|кешбэк|кэшбек|зп|зарплата|получил|получено|заработано|заработал)(\s?|\$|€|~)+\d/gim;

const onlyNumberString = 'A-Za-z0-9_.,';
const rublesString =
  ' рублей|рублей|рублей | руб|руб|руб | р|р|р | ₽|₽|₽ | rub|rub|rub ';
const regExpRubles = new RegExp(rublesString);
const euroString = ' евро|евро| €|€|€ ';
const regExpEuro = new RegExp(euroString);
const usdString =
  ' долларов|долларов|долларов | доллар|доллар|доллар | dollars|dollars|dollars |\\$';
const regExpUsd = new RegExp(usdString);

const defaultOut = Object.freeze({ [EUR]: 0, [RUB]: 0, [USD]: 0 });
/**
 * @param {object} acc - accumulator
 * @param {object} money - money
 * @returns {object}
 */
const accMoney = (acc, money) => {
  acc[EUR] += money.eur;
  acc[RUB] += money.rub;
  acc[USD] += money.usd;
  return acc;
};
/**
 * @param {string} text - text
 * @returns {Array}
 */
const splitText = (text) => {
  return typeof text === 'string' ? text.split('\n') : [];
};
/**
 * Локализуем
 *
 * @param {object} money - money
 * @returns {object}
 */
const getFormatMoney = (money) => {
  const CURRENCY = 'currency';
  return {
    [EUR]: new Intl.NumberFormat('de-DE', {
      style: CURRENCY,
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(money[EUR]),
    [RUB]: new Intl.NumberFormat('ru-RU', {
      style: CURRENCY,
      currency: 'RUB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(money[RUB]),
    [USD]: new Intl.NumberFormat('en-US', {
      style: CURRENCY,
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(money[USD]),
  };
};
/**
 * @param {object} obj - obj
 * @param {Array} obj.texts - text array
 * @param {number} obj.type - money type
 * @returns {object}
 */
const getMoney = ({ texts, type }) => {
  if (!Array.isArray(texts)) {
    throw new Error('Invalid argument');
  }
  if (texts.length) {
    return texts
      .reduce((acc, raw) => {
        return acc.concat(...splitText(raw));
      }, [])
      .map((text) => {
        return formatType(text, type);
      })
      .map((text) => {
        return calcMoney(text);
      })
      .reduce((acc, money) => {
        return accMoney(acc, money);
      }, Object.assign({}, defaultOut));
  } else {
    return defaultOut;
  }
};
/**
 * @param {string} str - text
 * @param {number} type - type
 * @returns {string}
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
      throw new Error('formatType: Unknown type');
    }
  }
  return str;
};
/**
 * @param {string} str - string
 * @returns {object}
 */
const calcMoney = (str) => {
  if (str.length <= 1) {
    return defaultOut;
  }
  // явно объявляю доллары
  str = str.replace(/\$.+/, (str) => {
    return str.substr(1) + 'долларов';
  });
  // явно объявляю евро
  // TODO: говнокод :)
  str.replace(/€\d+/, (_str, index, text) => {
    let currentIndex = index + 1;
    let end = text.length - 1;
    while (currentIndex !== end) {
      const currentText = text[currentIndex];
      if (currentText === '.' || /\d/.test(currentText)) {
        currentIndex++;
        continue;
      }
      break;
    }
    const textFinded = text.substr(index, currentIndex);
    str = textFinded.replace('€', '').replace(/$/, 'евро');
    return str;
  });

  const numbers = str.match(str.match(regExpNumbers));
  if (!(numbers && numbers.length)) {
    return defaultOut;
  }
  return splitText(numbers.input).reduce((acc, text) => {
    return accMoney(acc, getAllSum(text));
  }, Object.assign({}, defaultOut));
};
/**
 * @param {string} str - text
 * @returns {number}
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
 * @param {string} numbers - number text
 * @returns {object}
 */
const getAllSum = (numbers) => {
  let out = numbers.replace(/^\D+/, '');
  out = out.replace(/к/i, () => {
    return '000';
  });
  // TODO: не обрабатывается случай `Игра престолов 1серия` => добавляется 1
  // Отсеивание int+float значений
  if (out.match(/^\d\.?(\d\d)?/) > '0') {
    const regexp = new RegExp(
      '[^' + onlyNumberString + rublesString + euroString + usdString + ']',
      'gim',
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
        } else if (regExpEuro.test(nextStr)) {
          return str.trimRight() + 'евро ';
        } else {
          return str.trimRight() + 'рублей ';
        }
      })
      .replace(/\s/g, ',')
      .split(',');
    return outArray
      .filter((temp) => {
        if (
          !temp.length ||
          !/\d/.test(temp) /*|| Number.isNaN(Number(temp))*/
        ) {
          return false;
        }
        return true;
      })
      .reduce((acc, str) => {
        if (regExpUsd.test(str)) {
          acc[USD] += cleanDirtyNumberString(str);
        } else if (regExpEuro.test(str)) {
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
/**
 * Высчитывание медианы
 *
 * @param  {Array} values - value array
 * @returns {number}
 */
const getMedian = (values) => {
  values.sort((a, b) => {
    return a - b;
  });
  const half = Math.floor(values.length / 2);
  if (values.length % 2) {
    return values[half];
  }
  return (values[half - 1] + values[half]) / 2.0;
};

module.exports = {
  getMoney,
  getFormatMoney,
  getMedian,
  TYPES,
};
