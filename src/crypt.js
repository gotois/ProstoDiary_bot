const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
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
  const cipher = crypto.createCipher(algorithm, password);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');

  return crypted;
}
/**
 *
 * @param text {String}
 * @param password {String}
 * @returns {String}
 */
function decrypt(text, password) {
  const decipher = crypto.createDecipher(algorithm, password);
  let dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');

  return dec;
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
  decode
};
