module.exports = (t) => {
  const { previousInput } = require('../../src/services/text.service');
  t.is(previousInput('Some'), 'Some…');
  t.is(previousInput('123456789'), '123456…');
};
