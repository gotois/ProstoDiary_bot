/**
 *
 * @param texts
 * @param local
 * @returns {String}
 */
function spentMoney(texts, local) {
  /**
   * @return {Number}
   */
  const allSpentMoney = (() => {
    if (texts.length) {
      return texts.map(text => calcMoney(text)).reduce((acc, money) => acc + money);
    } else {
      console.warn('Данные пусты!');
      return 0.0;
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
}
/**
 * Локализуем сумму в рублях
 * @param money {Number}
 * @returns {String}
 */
function getSumRub(money) {
  const options = {style: 'currency', currency: 'RUB'};
  const numberFormat = new Intl.NumberFormat('ru-RU', options);
  return numberFormat.format(money);
}
/**
 * TODO: Отрефатчить. Нужно дать возможность расширять
 * @param str {String}
 * @returns {number}
 */
function calcMoney(str) {
  let allSum = 0.0;
  if (str.length <= 1) {
    return allSum;
  }
  str = str.trim();
  //Находим число месяца
  const regExpMonthNumber = /^\d+ (?=Января|Февраля|Марта|Апреля|Мая|Июня|Июля|Августа|Сентября|Октября|Ноября|Декабря)/gi;
  // const monthNumber = str.match(regExpMonthNumber);
  //удаляем из поиска строчку число месяца
  str = str.replace(regExpMonthNumber, '');
  //находим год
  const regExpYear = /\d+ (?=Понедельник|Вторник|Среда|Четверг|Пятница|Суббота|Воскресенье)/gi;
  // const year = str.match(regExpYear);
  //удаляем строчку о найденном годе
  str = str.replace(regExpYear, '');
  //находим вес
  const regExpWeight = /вес.\d+(,|\.).+/gi;
  // const weight = str.match(regExpWeight);
  //удаляем строчку о своем весе
  str = str.replace(regExpWeight, '');
  //находим свою зп
  const regExpMyZP = /(зп|зарплата).+\d/gi;
  // const myZP = str.match(regExpMyZP);
  //удаляем из поиска строчку о зарплате
  str = str.replace(regExpMyZP, '');
  //находим цифры потраченное
  const regExpNumbers = str.match(/^.+ (\d+)/gi);
  const numbers = str.match(regExpNumbers);
  if (numbers) {
    allSum = getAllSum(numbers.input);
  }
  return allSum;
}
/**
 * @param numbers {String}
 * @returns {number}
 */
function getAllSum(numbers) {
  let daySpentMoney = 0.0;
  let out = numbers.replace(/^\D+/, '');
  out = out.replace(/р|руб|₽| р| ₽| руб| рублей/i, '');
  out = out.replace(/к/i, () => '000');
  if (out.match(/^\d/) > '0') {
    out = out.replace(/\W/gi, '');
    out = Number.parseFloat(out);
    daySpentMoney += out;
  }
  return daySpentMoney;
}

module.exports = spentMoney;
