const { IS_PRODUCTION } = require('../../src/environment');

module.exports = async (t) => {
  t.timeout(5000);
  const currencyService = require('../../src/services/currency.service');
  const usdBaseCurrency = await currencyService.exchangeratesapi({
    base: 'USD',
  });
  if (!IS_PRODUCTION) {
    t.log(usdBaseCurrency);
  }
  t.is(typeof usdBaseCurrency.date, 'string');
};
