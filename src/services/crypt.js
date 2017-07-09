const crypto = require('crypto');
const options = {
  algorithm: 'aes-256-ctr',
};

/**
 *
 * @return {string}
 */
function getPassword() {
  return process.env.SALT_PASSWORD;
}
/**
 *
 * @param text {String}
 * @param password {String}
 * @returns {String}
 */
function encrypt(text, password) {
  const cipher = crypto.createCipher(options.algorithm, password);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}
/**
 *
 * @param text {String}
 * @param password {String}
 * @returns {String}
 */
function decrypt(text, password) {
  const decipher = crypto.createDecipher(options.algorithm, password);
  return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
}
/**
 *
 * @param entry {String}
 * @returns {String}
 */
function decode(entry) {
  try {
    return decrypt(entry, getPassword());
  } catch (error) {
    return entry;
  }
}
/**
 *
 * @param text {String}
 * @returns {String}
 */
function encode(text) {
  if (!text) {
    throw 'Empty text';
  }
  return encrypt(text, getPassword());
}

module.exports = {
  encode,
  decode,
};
