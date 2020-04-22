const logger = require('../../lib/log');
const storyLogger = require('../../services/story-logger.service');
const AcceptAction = require('../../core/models/action/accept');
/**
 * @param {object} document - jsonld document
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<*>}
 */
module.exports = function (document, { passport }) {
  logger.info('insert');
  try {
    storyLogger.info({
      document,
      passport,
    });
    return Promise.resolve(
      AcceptAction({ abstract: 'Данные отправлены в очередь' }),
    );
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
