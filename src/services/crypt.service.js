const crypto = require('crypto');
const {SALT_PASSWORD} = process.env;
const UTF8 = 'utf8';
const HEX = 'hex';
const options = {
  algorithm: 'aes-256-ctr',
};

/**
 *
 * @return {string}
 */
const getPassword = () => {
  return SALT_PASSWORD;
};
/**
 *
 * @param text {String}
 * @param password {String}
 * @returns {String}
 */
const encrypt = (text, password) => {
  const cipher = crypto.createCipher(options.algorithm, password);
  return cipher.update(text, UTF8, HEX) + cipher.final(HEX);
};
/**
 *
 * @param text {String}
 * @param password {String}
 * @returns {String}
 */
const decrypt = (text, password) => {
  const decipher = crypto.createDecipher(options.algorithm, password);
  return decipher.update(text, HEX, UTF8) + decipher.final(UTF8);
};
/**
 *
 * @param entry {String}
 * @returns {String}
 */
const decode = entry => {
  try {
    return decrypt(entry, getPassword());
  } catch (error) {
    console.error(error);
    return entry;
  }
};
/**
 * @param text {String}
 * @returns {String}
 */
const encode = text => {
  if (!text) {
    throw 'Empty text';
  }
  return encrypt(text, getPassword());
};

module.exports = {
  encode,
  decode,
};
