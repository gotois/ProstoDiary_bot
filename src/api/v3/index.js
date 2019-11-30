for (const api of [
  // 'backup',
  // 'destroy',
  // 'edit',
  'signin',
  'signout',
  'oauth',
  'help',
  // 'naturalization',
  // 'notification',
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
