const bot = require('../bot');
const crypto = require('crypto');
const logger = require('../services/logger.service');
const packageJSON = require('../../package');
const { IS_PRODUCTION } = require('../env');
/**
 * @param {Buffer} str - file
 * @param {string} algorithm - algorithm
 * @param {string} encoding - encoding
 * @returns {string}
 */
const generateChecksum = (str, algorithm = 'md5', encoding = 'hex') => {
  return crypto
    .createHash(algorithm)
    .update(str, 'utf8')
    .digest(encoding);
};
/**
 *
 * @param  {object} chat - chat
 * @returns {Promise<undefined>}
 */
const getVersion = async ({ chat }) => {
  logger.log('info', getVersion.name);
  const chatId = chat.id;
  let text = String(packageJSON.version);
  if (!IS_PRODUCTION) {
    text += ' - development';
  }
  // TODO: нужно получать чексумму всего проекта -
  // для этого настроить precommit хуку и создавать чексумму всех измененных файлов на гите, учитывая пользователя
  const checksum = generateChecksum(JSON.stringify(packageJSON));
  text += ' ' + checksum;
  await bot.sendMessage(chatId, text, {});
};

module.exports = getVersion;
