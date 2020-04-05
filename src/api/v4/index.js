for (const api of ['backup', 'health', 'help', 'ping', 'insert']) {
  /**
   * @returns {object}
   */
  module.exports[api] = require('./' + api);
}
