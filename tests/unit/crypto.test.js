module.exports = async (t) => {
  const crypt = require('../../src/services/crypt.service');
  const firstWord = crypt.encode('Something What?');
  const dWord = crypt.decode(firstWord);
  t.is(dWord, 'Something What?');
  t.throws(() => {
    crypt.encode(undefined);
  });

  const { publicKey, privateKey } = await crypt.generateRSA();
  t.true(publicKey.startsWith('-----BEGIN PUBLIC KEY-----'));
  t.true(privateKey.includes('-----END ENCRYPTED PRIVATE KEY-----'));
};
