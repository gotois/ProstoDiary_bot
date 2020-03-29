const jsigs = require('jsonld-signatures');
const { RSAKeyPair } = require('crypto-ld');
const { SERVER, IS_PRODUCTION } = require('../environment');

// sign the document as a simple assertion
const { RsaSignature2018 } = jsigs.suites;
const { AssertionProofPurpose } = jsigs.purposes;
const { SECURITY_CONTEXT_URL } = jsigs;

const getControllerId = (passportId) => {
  if (IS_PRODUCTION) {
    return 'https://gotointeractive.com/i/' + passportId;
  }
  return SERVER.HOST + 'i/' + passportId;
};
/**
 * Specify the public key object
 *
 * @param {Buffer} publicKeyPem - public key
 * @param {Buffer} privateKeyPem - private key
 * @param {*} controller - user controller
 * @returns {RSAKeyPair}
 */
const keyPair = (publicKeyPem, privateKeyPem, controller) => {
  const controllerKey = controller + '/keys/' + 1; // // todo по-умолчанию ключ всегда первый
  return new RSAKeyPair({
    '@context': SECURITY_CONTEXT_URL,
    'type': 'RsaVerificationKey2018',
    'id': controllerKey,
    'controller': controller,
    publicKeyPem,
    privateKeyPem,
  });
};
/**
 * Create the JSON-LD document that should be signed
 *
 * @param {object} document - jsonld document
 * @param {*} publicKeyPem - key pem
 * @param {*} privateKeyPem - key pem
 * @param {string} passportId - passport id
 * @returns {Promise<*>}
 */
async function signDocument(document, publicKeyPem, privateKeyPem, passportId) {
  const userController = getControllerId(passportId);
  const key = keyPair(publicKeyPem, privateKeyPem, userController);
  const signed = await jsigs.sign(document, {
    suite: new RsaSignature2018({ key }),
    purpose: new AssertionProofPurpose(),
  });
  return signed;
}
/**
 * проверка на валидность подписанного JSON-LD
 *
 * @todo передалать верификацию через website на основе урла контроллера
 * @param {object} signed - signed object
 * @param {object} passport - passport data
 * @returns {Promise<void|Error>}
 */
async function verifyDocument(signed, passport) {
  const publicKeyPem = passport.public_key_cert.toString('utf8');
  const privateKeyPem = passport.private_key_cert.toString('utf8');
  const userId = passport.passport_id;
  const userController = getControllerId(userId);
  const controllerKey = userController + '/keys/' + 1; // todo по-умолчанию ключ всегда первый
  const key = keyPair(publicKeyPem, privateKeyPem, userController);
  const publicKey = {
    '@context': SECURITY_CONTEXT_URL,
    'type': 'RsaVerificationKey2018',
    'id': controllerKey,
    'controller': userController,
    publicKeyPem,
  };

  // we will need the documentLoader to verify the controller
  // verify the signed document
  const result = await jsigs.verify(signed, {
    documentLoader: (url) => {
      const CONTEXTS = {
        [controllerKey]: publicKey,
      };
      return {
        contextUrl: null, // this is for a context via a link header
        document: CONTEXTS[url], // this is the actual document that was loaded
        documentUrl: url, // this is the actual context URL after redirects
      };
    },
    suite: new RsaSignature2018(key),
    purpose: new AssertionProofPurpose({
      // specify the public key controller object
      controller: {
        '@context': SECURITY_CONTEXT_URL,
        'id': userController,
        'publicKey': [publicKey],
        // this authorizes this key to be used for making assertions
        'assertionMethod': [publicKey.id],
      },
    }),
  });
  if (!result.verified) {
    throw new Error(result.error);
  }
}

module.exports = {
  signDocument,
  verifyDocument,
};
