const { Ed25519KeyPair } = require('crypto-ld');
const ldSignature = require('../../src/services/linked-data-signature.service');

module.exports = async (t) => {
  const document = require('../fixtures/documents/eat-action');
  const { privateKeyBase58, publicKeyBase58 } = await Ed25519KeyPair.generate(
    {},
  );
  const keyPare = await Ed25519KeyPair.from({
    privateKeyBase58: privateKeyBase58,
    publicKeyBase58: publicKeyBase58,
  });
  const signedDocument = await ldSignature.signDocument(
    document,
    keyPare,
    'something',
  );
  t.is(typeof signedDocument['https://w3id.org/security#proof'], 'object');
};
