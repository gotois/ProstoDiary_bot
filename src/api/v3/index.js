for (const api of [
  // 'backup',
  // 'destroy',
  // 'edit',
  'signin',
  'oauth',
  // 'sign-out',
  'help',
  // 'naturalization',
  // 'notification',
  'ping',
  'post',
  // 'remove',
  // 'search',
  // 'sleep',
]) {
  /**
   * @returns {object}
   */
  module.exports[api] = require('./' + api);
}
