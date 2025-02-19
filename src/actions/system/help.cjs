const crypto = require('crypto');
const packageLock_ = require('../../../package-lock.json');
const package_ = require('../../../package.json');
/**
 * @param {Buffer|string} buffer - file
 * @param {string} algorithm - algorithm
 * @param {string} encoding - encoding
 * @returns {string}
 */
const getCheckSum = (buffer, algorithm = 'md5', encoding = 'hex') => {
  return crypto.createHash(algorithm).update(buffer, 'utf8').digest(encoding);
};

// Помощь
module.exports = async (bot, message) => {
  const helpData = Object.entries({
    help: 'Помощь',
    ping: 'Проверка связи',
    // eslint-disable-next-line
  }).reduce((accumulator, [command, description]) => {
    accumulator['/' + command.toLowerCase()] = description;
    return accumulator;
  }, {});
  const commandsReadable =
    // eslint-disable-next-line
    Object.keys(helpData).reduce((accumulator, key) => {
      const description = helpData[key];
      const result = `${key}: ${description}\n`;
      accumulator += result;
      return accumulator;
    }, '') +
    '\n' +
    package_.name +
    ': ' +
    packageLock_.version +
    '\nF.A.Q.: ' +
    package_.homepage +
    '/faq/' +
    '\nCHECKSUM: ' +
    getCheckSum(JSON.stringify(packageLock_));
  const string_ = `Используйте команды:\n${commandsReadable}`;
  await bot.sendMessage(message.chat.id, string_, {
    disable_notification: true,
    disable_web_page_preview: true,
  });
};
