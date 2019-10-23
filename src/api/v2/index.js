for (const api of [
  'backup',
  'balance',
  'database-clear',
  'edited-message-text',
  'help',
  'kpp',
  'location',
  'ping',
  'post',
  'remove',
  'search',
  'version',
]) {
  /**
   * @returns {object}
   */
  module.exports[api] = require('./' + api);
}
