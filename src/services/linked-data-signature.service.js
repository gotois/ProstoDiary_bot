const jsigs = require('jsonld-signatures');
const { RSAKeyPair } = require('crypto-ld');
// const { documentLoaders } = require('jsonld');

// sign the document as a simple assertion
const { RsaSignature2018 } = jsigs.suites;
const { AssertionProofPurpose } = jsigs.purposes;

const fs = require('fs');
const publicKeyPem = fs.readFileSync('./public.key.txt').toString('utf8');
const privateKeyPem = fs.readFileSync('./private.key.txt').toString('utf8');

const publicKey = {
  '@context': jsigs.SECURITY_CONTEXT_URL,
  'type': 'RsaVerificationKey2018',
  'id': 'https://example.com/i/alice/keys/1',
  'controller': 'https://example.com/i/alice',
  publicKeyPem,
};

// specify the public key object
const keyPair = () => {
  const key = new RSAKeyPair({ ...publicKey, privateKeyPem });
  return key;
};
const key = keyPair();

// create the JSON-LD document that should be signed
async function signDocument(document) {
  const signed = await jsigs.sign(document, {
    suite: new RsaSignature2018({ key }),
    purpose: new AssertionProofPurpose(),
  });
  return signed;
}

async function verifyDocument(signed) {
  // specify the public key controller object
  const controller = {
    '@context': jsigs.SECURITY_CONTEXT_URL,
    'id': 'https://example.com/i/alice',
    'publicKey': [publicKey],
    // this authorizes this key to be used for making assertions
    'assertionMethod': [publicKey.id],
  };

  // const { node: documentLoader } = documentLoaders;

  // we will need the documentLoader to verify the controller
  // verify the signed document
  const result = await jsigs.verify(signed, {
    // documentLoader,
    // todo по идее надо наследовать и переложить эту выдачу на отдельный сервер
    documentLoader: (url) => {
      const CONTEXTS = {
        'https://example.com/i/alice/keys/1': publicKey,
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
    throw result.error;
  }
  return result;
}

module.exports = {
  signDocument,
  verifyDocument,
};
