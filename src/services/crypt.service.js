const openpgp = require('openpgp');
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
 * @param {Buffer|string} buffer - file
 * @param {string} algorithm - algorithm
 * @param {string} encoding - encoding
 * @returns {string}
 */
const getCheckSum = (buffer, algorithm = 'md5', encoding = 'hex') => {
  return crypto
    .createHash(algorithm)
    .update(buffer, 'utf8')
    .digest(encoding);
};
/**
 * @deprecated
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
 * @deprecated
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

const openpgpEncrypt = async (buffer, passwords) => {
  if (Buffer.byteLength(buffer) === 0) {
    throw new Error('Empty buffer');
  }
  const encrypted = await openpgp.encrypt({
    message: openpgp.message.fromBinary(buffer),
    passwords,
    compression: openpgp.enums.compression.zlib,
  });
  return encrypted;
};

const openpgpDecrypt = async (buffer, passwords) => {
  const utf8Content = buffer.toString('utf8');
  if (utf8Content.startsWith('-----BEGIN PGP MESSAGE-----')) {
    const rawDecrypt = await openpgp.decrypt({
      message: await openpgp.message.readArmored(utf8Content),
      passwords,
      format: 'binary',
    });
    return rawDecrypt.data;
  }
  return utf8Content;
};

module.exports = {
  encode,
  decode,
  openpgpEncrypt,
  openpgpDecrypt,
  getCheckSum,
};
