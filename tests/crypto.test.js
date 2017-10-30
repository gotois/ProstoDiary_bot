module.exports = t => {
  const crypt = require('../src/services/crypt.service');
  const eWord = crypt.encode('Something What?');
  const dWord = crypt.decode(eWord);
  t.is(dWord, 'Something What?');
};
