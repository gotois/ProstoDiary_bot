for (const api of [
  'backup',
  'text',
  'mail',
  'remove',
  'search',
  'edited-message-text',
  'kpp',
  'script',
]) {
  /**
   * @returns {object}
   */
  module.exports[api] = require('./' + api);
}
