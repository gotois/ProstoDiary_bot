const [EUR, RUB, USD,] = ['eur', 'rub', 'usd',];
const RUB_SYMBOL = '₽';
const DOLLAR_SYMBOL = '$';
const EURO_SYMBOL = '€';
const CURRENCY = {
  [RUB]: ['рублей', 'руб', 'rub'],
  [EUR]: ['евро'],
  [USD]: ['долларов', 'доллара', 'доллар', 'dollars'],
};

/**
 * @param query {string}
 * @returns {string}
 */
const formatQuery = ([query]) => {
  let temp = query;
  temp = temp.trim();
  
  // currency
  // example: 5 рублей -> 5 ₽
  for (const currency of CURRENCY[RUB]) {
    temp = temp.split(currency).join(RUB_SYMBOL);
  }
  for (const currency of CURRENCY[USD]) {
    temp = temp.split(currency).join(DOLLAR_SYMBOL);
  }
  for (const currency of CURRENCY[EUR]) {
    temp = temp.split(currency).join(EURO_SYMBOL);
  }
  
  // example: .5 -> 0.5
  temp = temp.replace(/\.\d+/gm, (match, index, text) => {
    if (index === 0) {
      match = '0' + match;
    } else if ([' '].includes(text[index - 1])) {
      match = '0' + match;
    }
    return match;
  });
  
  return temp;
};

module.exports = {
  formatQuery,
};
