for (const api of [
  'backup',
  'health',
  'notify-tg',
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
