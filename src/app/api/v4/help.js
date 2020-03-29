const packageLock_ = require('../../../../package-lock.json');
const logger = require('../../../lib/log');
const { telegram } = require('../../../include/telegram-bot/commands');
const { IS_PRODUCTION } = require('../../../environment');
const { getCheckSum } = require('../../../services/crypt.service');
const commandLogger = require('../../../services/command-logger.service');
const linkedDataSignature = require('../../../services/linked-data-signature.service');
const RejectAction = require('../../../core/models/actions/reject');
const AcceptAction = require('../../../core/models/actions/accept');
/**
 * @returns {string}
 */
function response() {
  const helpData = Object.entries(telegram).reduce(
    (accumulator, [command, object]) => {
      if (object.description.length === 0) {
        return accumulator;
      }
      accumulator['/' + command.toLowerCase()] = object.description;
      return accumulator;
    },
    {},
  );
  let message =
    Object.keys(helpData).reduce((accumulator, key) => {
      const result = `${key}: ${helpData[key]}\n`;
      accumulator += result;
      return accumulator;
    }, '') +
    '\n\nF.A.Q.: ' +
    'https://prosto-diary.gotointeractive.com/faq/\n\n';
  message += packageLock_.version;
  if (IS_PRODUCTION) {
    message += ' - production\n';
  }
  message += ' \n' + getCheckSum(JSON.stringify(packageLock_));
  return message;
}
/**
 * @param {object} document - parameters
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<*>}
 */
module.exports = async function(document, { passport }) {
  logger.info('help');
  try {
    await linkedDataSignature.verifyDocument(document, passport);
    const message = response();
    commandLogger.info({
      document: {
        ...document,
        ...AcceptAction(message, 'text/markdown'),
      },
      passport,
    });
    return Promise.resolve(AcceptAction(message));
  } catch (error) {
    return Promise.reject(
      this.error(400, null, JSON.stringify(RejectAction(error))),
    );
  }
};
