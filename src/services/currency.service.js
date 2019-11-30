// https://exchangeratesapi.io/
const { get, toQueryString } = require('./request.service');
/**
 * @constant
 * @type {string}
 */
const EXCHANGERATES_API_HOST = 'api.exchangeratesapi.io';
/**
 * @constant
 * @type {object}
 */
const CURRENCIES = {
  EUR: 'eur',
  RUB: 'rub',
  USD: 'usd',
};
/**
 * latest, 2010-01-12, latest?base=USD, latest?symbols=USD,GBP, history?start_at=2018-01-01&end_at=2018-09-01, history?start_at=2018-01-01&end_at=2018-09-01&symbols=ILS,JPY, history?start_at=2018-01-01&end_at=2018-09-01&base=USD
 *
 * @param {object} obj - obj
 * @param {string|undefined} obj.date - 2010-01-12 | history | latest
 * @param {string|undefined} obj.startAt - 2018-01-01
 * @param {string|undefined} obj.endAt - 2018-09-01
 * @param {Array|undefined} obj.symbols - ILS,JPY
 * @returns {Promise<undefined>}
 */
const exchangeratesapi = async ({
  date,
  base,
  startAt,
  endAt,
  symbols = [],
}) => {
  if (!date) {
    if (startAt) {
      date = 'history';
    } else {
      date = 'latest';
    }
  }
  const parameters = toQueryString({
    base,
    start_at: startAt,
    end_at: endAt,
    symbols: symbols.toString(),
  });
  const url = `https://${EXCHANGERATES_API_HOST}/${date}` + parameters;
  const html = await get(url);
  return html;
};

module.exports = {
  CURRENCIES,
  exchangeratesapi,
};
