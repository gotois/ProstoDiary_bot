module.exports = (t) => {
  const crypt = require('../../src/services/crypt.service');
  const firstWord = crypt.encode('Something What?');
  const dWord = crypt.decode(firstWord);
  t.is(dWord, 'Something What?');
  t.throws(() => {
    crypt.encode(undefined);
  });
};
