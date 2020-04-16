const jsigs = require('jsonld-signatures');
const { Ed25519KeyPair } = require('crypto-ld');
const { documentLoaders } = require('jsonld');
const logger = require('../lib/log');
const { Ed25519Signature2018 } = jsigs.suites;
const { AuthenticationProofPurpose } = jsigs.purposes;
const { node: documentLoader } = documentLoaders;
/**
 * Create the JSON-LD document that should be signed
 *
 * @param {object} document - jsonld document
 * @param {object} key - controller
 * @param {string} verificationMethod - verification
 * @returns {Promise<*>}
 */
async function signDocument(document, key, verificationMethod) {
  const signed = await jsigs.sign(document, {
    suite: new Ed25519Signature2018({
      verificationMethod,
      key,
    }),
    purpose: new AuthenticationProofPurpose({
      challenge: 'abc',
      domain: 'example.com',
    }),
  });
  return signed;
}
/**
 * Проверка на валидности подписанного JSON-LD
 *
 * @param {object} signed - signed document jsonld
 * @param {object} publicKey - publicKey
 * @returns {Promise<void|Error>}
 */
async function verifyDocument(signed, publicKey) {
  const controller = {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    // todo убрать хардкод 'tg'
    'id': 'https://gotointeractive.com/marketplace/tg',
    'publicKey': [publicKey],
    // this authorizes this key to be used for authenticating
    'authentication': [publicKey.id],
  };
  const result = await jsigs.verify(signed, {
    documentLoader,
    suite: new Ed25519Signature2018({
      key: new Ed25519KeyPair(publicKey),
    }),
    purpose: new AuthenticationProofPurpose({
      controller,
      challenge: 'abc',
      domain: 'example.com',
    }),
  });
  if (result.verified) {
    logger.info('Signature verified');
  } else {
    logger.error('Signature verification error');
    throw new Error(result.error);
  }
}

module.exports = {
  signDocument,
  verifyDocument,
};
