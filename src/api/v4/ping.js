const package_ = require('../../../package');
const logger = require('../../services/logger.service');
const linkedDataSignature = require('../../services/linked-data-signature.service');

/**
 * @param {jsonld} jsonld - parameters
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<*>}
 */
module.exports = async function(jsonld, { passport }) {
  logger.info('ping');
  // todo вызывает необработанное исключение
  // todo перенести в отдельный вызов для всех API
  // проверка на велидность подписанного JSON-LD например после отдачи ассистентом
  await linkedDataSignature.verifyDocument(
    jsonld,
    passport.public_key_cert.toString('utf8'),
    passport.private_key_cert.toString('utf8'),
    passport.passport_id,
  );

  // todo пока шифрование ботом излишне
  // шифрование абстракта через openPGP
  // const crypt = require('../../services/crypt.service');
  // const encrypted = await crypt.openpgpEncrypt(Buffer.from('pong'), [
  //   passport.secret_key,
  // ]);
  // encrypted.data.toString('base64')

  const document = {
    '@context': 'http://schema.org',
    '@type': 'AcceptAction',
    'agent': {
      '@type': 'Person',
      'name': package_.name,
    },
    'purpose': {
      '@type': 'Answer',
      'abstract': 'pong',
      'encodingFormat': 'text/plain',
    },
  };

  return Promise.resolve(document);
};
