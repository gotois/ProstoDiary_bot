const commandLogger = require('../../../services/command-logger.service');

const AssignAction = require('../../../core/models/action/assign');
/**
 * @param {object} document - parameters
 * @param {object} object - object
 * @param {object} object.passport - passport client user
 * @param {object} object.marketplace - marketplace
 * @returns {Promise<*>}
 */
module.exports = function (document, { marketplace, passport }) {
  try {
    const result = {
      '@type': 'Answer',
      'abstract': 'pong',
      'encodingFormat': 'text/markdown',
    };
    commandLogger.info({
      document,
      marketplace,
      passport,
      result,
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
