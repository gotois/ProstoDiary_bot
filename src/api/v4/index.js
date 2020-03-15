for (const api of [
  'backup',
  'health',
  'notify-tg',
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
