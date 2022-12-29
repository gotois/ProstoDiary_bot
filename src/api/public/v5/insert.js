const logger = require('../../../lib/log');
const storyLogger = require('../../../services/story-logger.service');
const AssignAction = require('../../../action/assign');
/**
 * @param {object} document - jsonld document
 * @param {object} object - credentions
 * @param {object} object.passport - passport
 * @param {object} object.marketplace - marketplace
 * @returns {Promise<*>}
 */
module.exports = function (document, { passport, marketplace }) {
  logger.info('insert');
  try {
    storyLogger.info({
      document,
      passport,
      marketplace,
      // result
    });
    return Promise.resolve(
      AssignAction({
        agent: document.agent,
      }),
    );
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
