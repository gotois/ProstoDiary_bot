const cryptoRandomString = require('crypto-random-string');
const speakeasy = require('speakeasy');
const { GeneratedSecret } = require('speakeasy');
const QRCode = require('qrcode');
/**
 * @constant
 * @type {string}
 */
const ENCODING_BASE32 = 'base32';
const ENCODING_HEX = 'hex';
/**
 * @param {object} options - options
 * @returns {GeneratedSecret}
 */
const generateUserSecret = async (options) => {
  const secret = speakeasy.generateSecret({
    ...options,
  });
  const qr = await QRCode.toDataURL(secret.otpauth_url);
  const masterPassword = cryptoRandomString({ length: 72, type: 'url-safe' });
  return {
    ...secret,
    masterPassword,
    qr,
  };
};
/**
 * @param {string} name - bot name
 * @returns {GeneratedSecret}
 */
const generateBotSecret = (name) => {
  return speakeasy.generateSecret({
    name,
  });
};
/**
 * @param {GeneratedSecret} secret - secret
 * @param {number} time - time
 * @returns {string}
 */
const generateBotToken = (secret, time) => {
  return speakeasy.totp({
    secret: secret.hex,
    time,
    encoding: ENCODING_HEX,
  });
};
/**
 * @description Проверить что переданный токен действительно валиден
 * @param {string} secretBase32 - Shared secret key
 * @param {string} token - authenticator token
 * @returns {boolean}
 */
const verifyUser = (secretBase32, token) => {
  return speakeasy.totp.verify({
    secret: secretBase32,
    token,
    encoding: ENCODING_BASE32,
  });
};
const verifyBot = (secret, token, time) => {
  return speakeasy.totp.verify({
    secret: secret.hex,
    token,
    time,
    encoding: ENCODING_HEX,
  });
};

module.exports = {
  generateUserSecret,
  generateBotSecret,
  generateBotToken,
  verifyUser,
  verifyBot,
};
