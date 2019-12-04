for (const api of [
  // 'backup',
  // 'destroy',
  // 'edit',
  'signin',
  'signout',
  'oauth',
  'help',
  // 'notify',
  'ping',
  'text',
  'story',
  'post',
  // 'remove',
  // 'search',
]) {
  /**
   * @returns {object}
   */
  module.exports[api] = require('./' + api);
}
