for (const api of [
  'backup',
  // 'destroy',
  // 'edit',
  'signin',
  'signout',
  'oauth',
  'help',
  // 'notify',
  'ping',
  'text',
  'post',
  // 'remove',
  // 'search',
]) {
  /**
   * @returns {object}
   */
  module.exports[api] = require('./' + api);
}
