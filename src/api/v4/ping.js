const commandLogger = require('../../services/command-logger.service');
const RejectAction = require('../../core/models/action/reject');
const AcceptAction = require('../../core/models/action/accept');
/**
 * @param {object} document - parameters
 * @param {object} passport - passport client user
 * @returns {Promise<*>}
 */
module.exports = function (document, { passport }) {
  try {
    const resultAction = AcceptAction({ abstract: 'pong' });
    commandLogger.info({
      document: {
        ...document,
        // todo превращать в AcceptAction внутри `commandTransport.on('logged' ...`
        ...resultAction,
      },
      passport,
    });
    return Promise.resolve(resultAction);
  } catch (error) {
    return Promise.reject(
      this.error(400, null, JSON.stringify(RejectAction(error))),
    );
  }
};
