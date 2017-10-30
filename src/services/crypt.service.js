const crypto = require('crypto');
const logger = require('../services/logger.service');
const {SALT_PASSWORD} = process.env;
/**
 * @constant {string}
 */
const UTF8 = 'utf8';
/**
 * @constant {string}
 */
const HEX = 'hex';
/**
 * @constant
 * @type {{algorithm: string}}
 */
const options = {
  algorithm: 'aes-256-ctr',
};
/**
 * @return {string}
 */
const getPassword = () => {
  return SALT_PASSWORD;
};
/**
 * @param text {String}
 * @param password {String}
 * @returns {String}
 */
const encrypt = (text, password) => {
  const cipher = crypto.createCipher(options.algorithm, password);
  return cipher.update(text, UTF8, HEX) + cipher.final(HEX);
};
/**
 * @param text {String}
 * @param password {String}
 * @returns {String}
 */
const decrypt = (text, password) => {
  const decipher = crypto.createDecipher(options.algorithm, password);
  return decipher.update(text, HEX, UTF8) + decipher.final(UTF8);
};
/**
 * @param entry {String}
 * @returns {String}
 */
const decode = entry => {
  try {
    return decrypt(entry, getPassword());
  } catch (error) {
    logger.log('error', error);
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
  return encrypt(text, getPassword());
};

module.exports = {
  encode,
  decode,
};
