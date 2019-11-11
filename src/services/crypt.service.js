const crypto = require('crypto');
const masterSalt = '123123123';
/**
 * @constant {string}
 */
const ALGORITHM = 'aes-256-ctr';
/**
 * @constant {number}
 */
const BITES_LENGTH = 16;
/**
 * @param {string} text - entry
 * @returns {string}
 */
const decode = (text) => {
  const sha256 = crypto.createHash('sha256');
  sha256.update(masterSalt);
  const input = Buffer.from(text, 'base64');
  // Initialization Vector
  const iv = input.slice(0, BITES_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, sha256.digest(), iv);
  const ciphertext = input.slice(BITES_LENGTH);
  return decipher.update(ciphertext) + decipher.final();
};
/**
 * @param {string} text - text
 * @returns {string}
 */
const encode = (text) => {
  if (!text) {
    throw new Error('Encode empty');
  }
  const sha256 = crypto.createHash('sha256');
  sha256.update(masterSalt);
  // Initialization Vector
  const iv = crypto.randomBytes(BITES_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, sha256.digest(), iv);
  const ciphertext = cipher.update(Buffer.from(text));
  return Buffer.concat([iv, ciphertext, cipher.final()]).toString('base64');
};

module.exports = {
  encode,
  decode,
};
