const speakeasy = require('speakeasy');
// const Story = require('./story.service');
/**
 * @constant
 * @type {string}
 */
// const ENCODING_BASE32 = 'base32';

module.exports = {
  /**
   * @param {string} account - email name
   * @returns {GeneratedSecret}
   */
  genereateGoogleAuth(account) {
    const secret = speakeasy.generateSecret({
      name: account,
      length: 20,
    });
    // Google Authentificator:
    // Account: account - 'bot@gotointeractive.com'
    // Key: secret.base32
    // Time-based flag: true
    return secret;
  },
  /**
   * @description показать токен который привязан к устройству
   * @todo нужно найти из истории secret (БД)
   * @returns {string}
   */
  // async showToken() {
  //   const secret = await Story.find({
  //     intent: 'auth',
  //   })
  //   return speakeasy.totp({
  //     secret,
  //     encoding: ENCODING_BASE32,
  //   });
  // },
  /**
   * @description Проверить что переданный токен действительно валиден
   * @todo нужно найти из истории secret (БД)
   * @param {string} token - token
   * @returns {boolean}
   */
  // async verify(token) {
  // const secret = await Story.find({
  //   intent: 'auth',
  // })
  // return speakeasy.totp.verify({
  //   secret,
  //   encoding: ENCODING_BASE32,
  //   token: token,
  // });
  // },
};
