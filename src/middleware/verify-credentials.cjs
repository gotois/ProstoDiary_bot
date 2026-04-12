const { verifyCredential } = require('@digitalbazaar/vc');
const { Ed25519Signature2020, suiteContext } = require('@digitalbazaar/ed25519-signature-2020');
const { Ed25519VerificationKey2020 } = require('@digitalbazaar/ed25519-verification-key-2020');
const cred = require('credentials-context');
const { JsonLdDocumentLoader } = require('jsonld-document-loader');

/**
 * @param {any} key - key
 * @description Создание загрузчика документов с кэшированием контекстов под конкретный ключ
 * @returns {(url: string) => any}
 */
function createDocumentLoader(key) {
  const jdl = new JsonLdDocumentLoader();
  jdl.addStatic(suiteContext.CONTEXT_URL, suiteContext.CONTEXT);
  jdl.addStatic(Ed25519Signature2020.CONTEXT_URL, Ed25519Signature2020.CONTEXT);
  jdl.addStatic(cred.CREDENTIALS_CONTEXT_V1_URL, cred.contexts.get(cred.constants.CREDENTIALS_CONTEXT_V1_URL));
  jdl.addStatic('https://www.w3.org/ns/activitystreams', {
    '@context': {
      '@vocab': 'https://www.w3.org/ns/activitystreams#',
      'type': '@type',
      'id': '@id',
      'actor': 'https://www.w3.org/ns/activitystreams#actor',
      'name': 'https://www.w3.org/ns/activitystreams#name',
      'email': 'https://www.w3.org/ns/activitystreams#email',
      'url': 'https://www.w3.org/ns/activitystreams#url',
      'object': 'https://www.w3.org/ns/activitystreams#object',
      'summary': 'https://www.w3.org/ns/activitystreams#summary',
      'attachment': 'https://www.w3.org/ns/activitystreams#attachment',
      'mediaType': 'https://www.w3.org/ns/activitystreams#mediaType',
      'target': 'https://www.w3.org/ns/activitystreams#target',
      'startTime': 'https://www.w3.org/ns/activitystreams#startTime',
      'endTime': 'https://www.w3.org/ns/activitystreams#endTime',
      'tag': 'https://www.w3.org/ns/activitystreams#tag',
      'published': 'https://www.w3.org/ns/activitystreams#published',
      'location': 'https://www.w3.org/ns/activitystreams#location',
    },
  });
  jdl.addStatic('https://www.w3.org/ns/did/v1', {
    '@context': {
      '@protected': true,
      'id': '@id',
      'type': '@type',
    },
  });
  jdl.addStatic('https://w3id.org/security/v2', {
    '@context': {
      '@version': 1.1,
      '@protected': true,
      'id': '@id',
      'type': '@type',
      'assertionMethod': {
        '@id': 'https://w3id.org/security#assertionMethod',
        '@type': '@id',
        '@container': '@set',
      },
      'authentication': {
        '@id': 'https://w3id.org/security#authenticationMethod',
        '@type': '@id',
        '@container': '@set',
      },
      'controller': {
        '@id': 'https://w3id.org/security#controller',
        '@type': '@id',
      },
      'publicKeyMultibase': 'https://w3id.org/security#publicKeyMultibase',
      'Ed25519VerificationKey2020': {
        '@id': 'https://w3id.org/security#Ed25519VerificationKey2020',
        '@context': {
          '@version': 1.1,
          '@protected': true,
          'id': '@id',
          'type': '@type',
          'controller': {
            '@id': 'https://w3id.org/security#controller',
            '@type': '@id',
          },
          'publicKeyMultibase': 'https://w3id.org/security#publicKeyMultibase',
        },
      },
    },
  });
  jdl.addStatic(key.controller, {
    '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/v2'],
    'id': key.controller,
    'assertionMethod': [
      {
        id: key.id,
        type: 'Ed25519VerificationKey2020',
        controller: key.controller,
        publicKeyMultibase: key.publicKeyMultibase,
      },
    ],
  });

  return jdl.build();
}

/**
 * @description Верификация подписанного документа (Verifiable Credential)
 * @param {object} request - request
 * @param {object} request.body - Подписанный VC документ
 * @param {object} response - response
 * @param {any} next - next
 * @returns {Promise<{verified: boolean, results: Array}>}
 * @throws {Error} - VerificationError
 */
module.exports = async function (request, response, next) {
  if (!request?.body) {
    return next(new Error('Invalid credential format'));
  }
  if (!request.body?.proof) {
    return next(new Error('Credential must have a proof'));
  }
  if (!request.body?.issuer) {
    return next(new Error('Credential must have an issuer'));
  }
  try {
    const responseActor = await fetch(request.body.id);
    if (!responseActor.ok) {
      return next(new Error('Actor Fetching Failed'));
    }
    const exportKeys = await responseActor.json();
    const key = await Ed25519VerificationKey2020.from(exportKeys);

    const result = await verifyCredential({
      credential: request.body,
      suite: new Ed25519Signature2020({ key }),
      documentLoader: createDocumentLoader(key),
    });

    if (!result.verified) {
      return next(result.error);
    }
    next();
  } catch (error) {
    return next(error);
  }
};
