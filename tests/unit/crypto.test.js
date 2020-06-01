module.exports = async (t) => {
  const crypt = require('../../src/services/crypt.service');
  const { publicKey, privateKey } = await crypt.generateRSA();
  t.true(publicKey.startsWith('-----BEGIN PUBLIC KEY-----'));
  t.true(privateKey.trimEnd().endsWith('-----END PRIVATE KEY-----'));
};
