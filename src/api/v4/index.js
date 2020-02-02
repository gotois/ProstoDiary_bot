for (const api of ['backup', 'help', 'ping', 'signin', 'text']) {
  /**
   * @returns {object}
   */
  module.exports[api] = require('./' + api);
}
