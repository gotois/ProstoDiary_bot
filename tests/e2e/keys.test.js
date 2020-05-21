const ldSignature = require('../../src/services/linked-data-signature.service');

module.exports = async (t) => {
  const document = require('../fixtures/documents/eat-action');
  const signedDocument = await ldSignature.signDocument(
    document,
    t.context.publicKey,
    t.context.privateKey,
    -1,
  );
  t.is(typeof signedDocument['https://w3id.org/security#proof'], 'object');
};
