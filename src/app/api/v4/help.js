const package_ = require('../../../../package.json');
const logger = require('../../../lib/log');
const { telegram } = require('../../../include/telegram-bot/commands');
const { IS_PRODUCTION } = require('../../../environment');
const { getCheckSum } = require('../../../services/crypt.service');

/**
 * @param {jsonld} jsonld - parameters
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<*>}
 */
// eslint-disable-next-line
module.exports = function(jsonld, { passport }) {
  logger.info('ping');

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
    // todo ссылку перенести в reply_markup: {
    //           inline_keyboard: [links],
    //         },
    '\n\nF.A.Q.: ' +
    'https://prosto-diary.gotointeractive.com/faq/\n\n';
  message += package_.version;
  if (IS_PRODUCTION) {
    message += ' - production\n';
  }
  // todo нужно получать чексумму всего проекта - для этого настроить precommit хуку и создавать чексумму всех измененных файлов на гите, учитывая пользователя
  message += ' \n' + getCheckSum(JSON.stringify(package_));

  const document = {
    '@context': 'http://schema.org',
    '@type': 'AcceptAction',
    'agent': {
      '@type': 'Person',
      'name': package_.name,
    },
    'purpose': {
      '@type': 'Answer',
      'abstract': message.toString('base64'),
      'encodingFormat': 'text/markdown',
    },
  };

  return Promise.resolve(document);
};
