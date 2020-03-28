module.exports = async (t) => {
  const linkedDataSignature = require('../../src/services/linked-data-signature.service');
  const document = require('../data/documents/eat-action');
  const signedDocument = await linkedDataSignature.signDocument(
    document,
    t.context.publicKey,
    t.context.privateKey,
    -1,
  );
  t.is(typeof signedDocument['https://w3id.org/security#proof'], 'object');
};
