module.exports = async (t) => {
  const translateService = require('../../src/lib/google-translate');
  const result = await translateService.translate('hello world', 'ru');
  t.true(result.length > 0);
  t.true(result.startsWith('Привет'));
};
