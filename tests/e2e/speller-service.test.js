module.exports = async (t) => {
  t.timeout(3000);
  const { spellText } = require('../../src/services/speller.service');

  const textMsk = await spellText('масква');
  t.is(textMsk, 'москва');

  const textNewYork = await spellText('new yorc');
  t.is(textNewYork, 'new york');
};
