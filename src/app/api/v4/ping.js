const commandLogger = require('../../../services/command-logger.service');
const linkedDataSignature = require('../../../services/linked-data-signature.service');
const RejectAction = require('../../../core/models/actions/reject');
const AcceptAction = require('../../../core/models/actions/accept');
/**
 * @param {object} document - parameters
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<*>}
 */
module.exports = async function(document, { passport }) {
  try {
    await linkedDataSignature.verifyDocument(document, passport);
    commandLogger.info({
      document: {
        ...document,
        ...AcceptAction('pong'),
      },
      passport,
    });
    return Promise.resolve(AcceptAction('pong'));
  } catch (error) {
    return Promise.reject(this.error(400, null, RejectAction(error)));
  }
};
