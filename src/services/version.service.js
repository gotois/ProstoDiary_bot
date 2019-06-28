const packageJSON = require('../../package');
const crypto = require('crypto');
/**
 * @param {Buffer} buffer - file
 * @param {string} algorithm - algorithm
 * @param {string} encoding - encoding
 * @returns {string}
 */
const generateChecksum = (buffer, algorithm = 'md5', encoding = 'hex') => {
  return crypto
    .createHash(algorithm)
    .update(buffer, 'utf8')
    .digest(encoding);
};
/**
 * @returns {string}
 */
const projectVersion = String(packageJSON.version);
/**
 * @todo нужно получать чексумму всего проекта - для этого настроить precommit хуку и создавать чексумму всех измененных файлов на гите, учитывая пользователя
 * @returns {string}
 */
const getCheckSum = () => {
  return generateChecksum(JSON.stringify(packageJSON));
};

module.exports = {
  projectVersion,
  getCheckSum,
};
