const jsigs = require('jsonld-signatures');
const { RSAKeyPair } = require('crypto-ld');
const { SERVER, IS_PRODUCTION } = require('../environment');

// sign the document as a simple assertion
const { RsaSignature2018 } = jsigs.suites;
const { AssertionProofPurpose } = jsigs.purposes;
const { SECURITY_CONTEXT_URL } = jsigs;

const getControllerId = (user) => {
  if (IS_PRODUCTION) {
    return 'https://gotointeractive.com/i/' + user;
  }
  return SERVER.HOST + 'i/' + user;
};

const getPublicKey = (publicKeyPem, controller) => {
  const controllerKey = controller + '/keys/1'; // todo насыщать из БД
  return {
    '@context': SECURITY_CONTEXT_URL,
    'type': 'RsaVerificationKey2018',
    'id': controllerKey,
    'controller': controller,
    publicKeyPem,
  };
};
/**
 * specify the public key object
 *
 * @param {Buffer} publicKeyPem - public key
 * @param {Buffer} privateKeyPem - private key
 * @param {*} controller - controller
 * @returns {RSAKeyPair}
 */
const keyPair = (publicKeyPem, privateKeyPem, controller) => {
  const publicKey = getPublicKey(publicKeyPem, controller);
  const key = new RSAKeyPair({ ...publicKey, privateKeyPem });
  return key;
};

// create the JSON-LD document that should be signed
async function signDocument(document, publicKeyPem, privateKeyPem, userId) {
  const key = keyPair(publicKeyPem, privateKeyPem, getControllerId(userId));
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

  const controllerId = getControllerId(userId);
  const publicKey = getPublicKey(publicKeyPem, controllerId);
  const key = keyPair(publicKeyPem, privateKeyPem, controllerId);

  // specify the public key controller object
  const controller = {
    '@context': SECURITY_CONTEXT_URL,
    'id': controllerId,
    'publicKey': [publicKey],
    // this authorizes this key to be used for making assertions
    'assertionMethod': [publicKey.id],
  };
  const controllerKey = controller.id + '/keys/1'; // todo насыщать из БД

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
    purpose: new AssertionProofPurpose({ controller }),
  });
  if (!result.verified) {
    throw new Error(result.error);
  }
}

module.exports = {
  signDocument,
  verifyDocument,
};
