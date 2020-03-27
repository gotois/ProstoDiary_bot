const logger = require('../../../services/logger.service');
const linkedDataSignature = require('../../../services/linked-data-signature.service');
const storyLogger = require('../../../services/story-logger.service');

/**
 * @param {jsonld} jsonld - parameters
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<*>}
 */
module.exports = async function(jsonld, { passport }) {
  try {
    await linkedDataSignature.verifyDocument(jsonld, passport);
  } catch (error) {
    logger.error(error);
    return Promise.reject(
      this.error(400, 'Проверка документа закончилась с ошибкой'),
    );
  }
  storyLogger.info(jsonld);
  return Promise.resolve('Данные отправлены в очередь');
};
