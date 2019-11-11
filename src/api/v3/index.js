for (const api of [
  // 'backup',
  // 'destroy',
  // 'edit',
  'sign-in',
  // 'sign-out',
  'registration',
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
