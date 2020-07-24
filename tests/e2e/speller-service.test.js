/* eslint-disable unicorn/no-useless-undefined */
module.exports = async (t) => {
  t.timeout(5000);
  const { spellText } = require('../../src/services/text.service');
  await t.throwsAsync(async () => {
    await spellText(undefined);
  });
  const textMsk = await spellText('масква');
  t.is(textMsk, 'москва');

  const textNewYork = await spellText('new yorc');
  t.is(textNewYork, 'new york');
};
