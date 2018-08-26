const crypto = require('crypto');
const logger = require('../services/logger.service');
const {SALT_PASSWORD} = require('../env');
/**
 * @constant {string}
 */
const ALGORITHM = 'aes-256-ctr';
/**
 * @constant {number}
 */
const BITES_LENGTH = 16;
/**
 * @param text {String}
 * @returns {String}
 */
const encrypt = (text) => {
  const sha256 = crypto.createHash('sha256');
  sha256.update(SALT_PASSWORD);
  // Initialization Vector
  const iv = crypto.randomBytes(BITES_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, sha256.digest(), iv);
  const ciphertext = cipher.update(new Buffer(text));
  return Buffer.concat([iv, ciphertext, cipher.final()]).toString('base64');
};
/**
 * @param text {String}
 * @returns {String}
 */
const decrypt = (text) => {
  const sha256 = crypto.createHash('sha256');
  sha256.update(SALT_PASSWORD);
  const input = new Buffer(text, 'base64');
  // Initialization Vector
  const iv = input.slice(0, BITES_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, sha256.digest(), iv);
  const ciphertext = input.slice(BITES_LENGTH);
  return decipher.update(ciphertext) + decipher.final();
};
/**
 * @param entry {String}
 * @returns {String}
 */
const decode = entry => {
  try {
    return decrypt(entry);
  } catch (error) {
    logger.log('error', error.toString());
    return entry;
  }
};
/**
 * @param text {String}
 * @returns {String}
 */
const encode = text => {
  if (!text) {
    throw new Error('Encode empty');
  }
  return encrypt(text);
};

module.exports = {
  encode,
  decode,
};
