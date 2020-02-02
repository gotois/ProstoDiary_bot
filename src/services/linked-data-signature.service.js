const jsigs = require('jsonld-signatures');
const { RSAKeyPair } = require('crypto-ld');

// sign the document as a simple assertion
const { RsaSignature2018 } = jsigs.suites;
const { AssertionProofPurpose } = jsigs.purposes;

const getControllerId = (user) => {
  return 'https://gotointeractive.com/i/' + user;
};

const getPublicKey = (publicKeyPem, controller) => {
  const controllerKey = controller + '/keys/1'; // todo насыщать из БД
  return {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    'type': 'RsaVerificationKey2018',
    'id': controllerKey,
    'controller': controller,
    publicKeyPem,
  };
};

// specify the public key object
const keyPair = (publicKeyPem, privateKeyPem, controller) => {
  const publicKey = getPublicKey(publicKeyPem, controller);
  const key = new RSAKeyPair({ ...publicKey, privateKeyPem });
  return key;
};

// todo перенести функционал подписи документа внутрь core
// create the JSON-LD document that should be signed
async function signDocument(document, publicKeyPem, privateKeyPem, userId) {
  const key = keyPair(publicKeyPem, privateKeyPem, getControllerId(userId));
  const signed = await jsigs.sign(document, {
    suite: new RsaSignature2018({ key }),
    purpose: new AssertionProofPurpose(),
  });
  return signed;
}

// todo передалать верификацию через website на основе урла контроллера
async function verifyDocument(signed, publicKeyPem, privateKeyPem, userId) {
  const publicKey = getPublicKey(publicKeyPem, getControllerId(userId));
  const key = keyPair(publicKeyPem, privateKeyPem, getControllerId(userId));
  // specify the public key controller object
  const controller = {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    'id': getControllerId(userId),
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
