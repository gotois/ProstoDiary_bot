for (const api of [
  'backup',
  'health',
  'notify',
  'help',
  'ping',
  'signin',
  'signout',
  'text',
]) {
  /**
   * @returns {object}
   */
  module.exports[api] = require('./' + api);
}
