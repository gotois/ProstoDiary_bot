const storyLogger = require('../../../services/story-logger.service');
const linkedDataSignature = require('../../../services/linked-data-signature.service');
const RejectAction = require('../../../core/models/actions/reject');
const AcceptAction = require('../../../core/models/actions/accept');
/**
 * @param {object} document - jsonld document
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<*>}
 */
module.exports = async function(document, { passport }) {
  try {
    await linkedDataSignature.verifyDocument(document, passport);
    storyLogger.info({
      document,
      passport,
    });
    return Promise.resolve(AcceptAction('Данные отправлены в очередь'));
  } catch (error) {
    return Promise.reject(this.error(400, null, RejectAction(error)));
  }
};
