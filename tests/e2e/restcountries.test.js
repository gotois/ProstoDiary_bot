module.exports = async (t) => {
  t.timeout(4000);
  const { getFullName } = require('../../src/services/restcountries.service');
  const parsedRestCountries = await getFullName('aruba');
  t.true(Array.isArray(parsedRestCountries));
};
