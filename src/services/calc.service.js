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
 * @param {object} accumulator - accumulator
 * @param {object} money - money
 * @returns {object}
 */
const accumulatorMoney = (accumulator, money) => {
  accumulator[EUR] += money.eur;
  accumulator[RUB] += money.rub;
  accumulator[USD] += money.usd;
  return accumulator;
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
    throw new TypeError('Invalid argument');
  }
  if (texts.length === 0) {
    return defaultOut;
  }
  return texts
    .reduce((accumulator, raw) => {
      return accumulator.concat(...splitText(raw));
    }, [])
    .map((text) => {
      return formatType(text, type);
    })
    .map((text) => {
      return calcMoney(text);
    })
    .reduce((accumulator, money) => {
      return accumulatorMoney(accumulator, money);
    }, Object.assign({}, defaultOut));
};
/**
 * @param {string} string - text
 * @param {number} type - type
 * @returns {string}
 */
const formatType = (string, type) => {
  string = string.trim();
  // Находим число месяца и удаляем из поиска строчку число месяца
  string = string.replace(regExpMonthNumber, '');
  // Находим год и удаляем строчку о найденном годе
  string = string.replace(regExpYear, '');
  // Находим вес и удаляем строчку о своем весе
  string = string.replace(regExpWeight, '');
  // Удаляем знак + чтобы не было рекурсивного обхода регулярки
  string = string.replace(/\+/, '');

  switch (type) {
    // Удаляем строчку о зарплате и прочих получениях
    case TYPES.allSpent: {
      if (string.match(regExpMyZP)) {
        string = '';
      }
      break;
    }
    // Находим потраченное
    case TYPES.allReceived: {
      if (!string.match(regExpMyZP)) {
        string = '';
      }
      break;
    }
    default: {
      throw new Error('formatType: Unknown type');
    }
  }
  return string;
};
/**
 * @param {string} string - string
 * @returns {object}
 */
const calcMoney = (string) => {
  if (string.length <= 1) {
    return defaultOut;
  }
  // явно объявляю доллары
  string = string.replace(/\$.+/, (subString) => {
    return subString.slice(1) + 'долларов';
  });
  // явно объявляю евро
  // TODO: говнокод :)
  string.replace(/€\d+/, (subString, index, text) => {
    let currentIndex = index + 1;
    const end = text.length - 1;
    while (currentIndex !== end) {
      const currentText = text[currentIndex];
      if (currentText === '.' || /\d/.test(currentText)) {
        currentIndex++;
        continue;
      }
      break;
    }
    const textFinded = text.slice(index, currentIndex);
    string = textFinded.replace('€', '').replace(/$/, 'евро');
    return string;
  });

  const numbers = string.match(string.match(regExpNumbers));
  if (!(numbers && numbers.length > 0)) {
    return defaultOut;
  }
  return splitText(numbers.input).reduce((accumulator, text) => {
    return accumulatorMoney(accumulator, getAllSum(text));
  }, Object.assign({}, defaultOut));
};
/**
 * @param {string} string - text
 * @returns {number}
 */
const cleanDirtyNumberString = (string) => {
  const [value] = string
    .replace(regExpEuro, '')
    .replace(regExpUsd, '')
    .replace(regExpRubles, '')
    .replace(/\.$/, '')
    .match(/\d+$|\d+\.\d+/, '') || [0];
  return Number.parseFloat(value);
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
      .replace(
        /\d+\.?(\d\d)?(\s|$)/,
        (string, argument2, argument3, index, all) => {
          const start = index + string.length;
          const end = index + 6 + string.length;
          const nextString = all.slice(start, end);
          if (regExpUsd.test(nextString)) {
            return string.trimRight() + 'долларов ';
          } else if (regExpEuro.test(nextString)) {
            return string.trimRight() + 'евро ';
          } else {
            return string.trimRight() + 'рублей ';
          }
        },
      )
      .replace(/\s/g, ',')
      .split(',');
    return outArray
      .filter((temporaryString) => {
        if (
          temporaryString.length === 0 ||
          !/\d/.test(temporaryString) /*|| Number.isNaN(Number(temp))*/
        ) {
          return false;
        }
        return true;
      })
      .reduce((accumulator, string) => {
        if (regExpUsd.test(string)) {
          accumulator[USD] += cleanDirtyNumberString(string);
        } else if (regExpEuro.test(string)) {
          accumulator[EUR] += cleanDirtyNumberString(string);
        } else {
          accumulator[RUB] += cleanDirtyNumberString(string);
        }
        return accumulator;
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
  return (values[half - 1] + values[half]) / 2;
};

module.exports = {
  getMoney,
  getFormatMoney,
  getMedian,
  TYPES,
};
