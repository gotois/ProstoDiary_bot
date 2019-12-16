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
  'post',
  // 'remove',
  // 'search',
]) {
  /**
   * @returns {object}
   */
  module.exports[api] = require('./' + api);
}
