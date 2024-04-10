const crypto = require('crypto');
const packageLock_ = require('../../../package-lock.json');
const package = require('../../../package.json');
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
module.exports = (bot, message) => {
  const helpData = Object.entries({
    help: 'Помощь',
    ping: 'Ping',
  }).reduce(
    (accumulator, [command, description]) => {
      accumulator['/' + command.toLowerCase()] = description;
      return accumulator;
    },
    {},
  );
  let commandsReadable = Object.keys(helpData).reduce((accumulator, key) => {
      const description = helpData[key];
      const result = `${key}: ${description}\n`;
      accumulator += result;
      return accumulator;
    }, '') +
    '\nF.A.Q.: ' + package.homepage + '/faq/' +
    '\nVer.: ' + packageLock_.version +
    '\nCheck.: ' + getCheckSum(JSON.stringify(packageLock_));
  bot.sendMessage(message.chat.id, 'Используйте команды:\n' + commandsReadable);
};
