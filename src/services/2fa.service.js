const cryptoRandomString = require('crypto-random-string');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
/**
 * @constant
 * @type {string}
 */
const ENCODING_BASE32 = 'base32';
/**
 * @param {object} options - options
 * @returns {GeneratedSecret}
 */
const generateSecret = async (options) => {
  const secret = speakeasy.generateSecret({
    ...options,
  });
  const qr = await QRCode.toDataURL(secret.otpauth_url);
  const secretPassword = cryptoRandomString({ length: 72, type: 'url-safe' });
  return {
    ...secret,
    secretPassword,
    qr,
  };
};
/**
 * @description Проверить что переданный токен действительно валиден
 * @param {string} secret - Shared secret key
 * @param {string} token - authenticator token
 * @returns {boolean}
 */
const verify = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    token,
    encoding: ENCODING_BASE32,
  });
};

module.exports = {
  generateSecret,
  verify,
};
