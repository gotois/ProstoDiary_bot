for (const api of [
  'backup',
  'health',
  'help',
  'ping',
  'signin',
  'signout',
  'insert',
]) {
  /**
   * @returns {object}
   */
  module.exports[api] = require('./' + api);
}
