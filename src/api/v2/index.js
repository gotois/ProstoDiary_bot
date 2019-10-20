for (const api of [
  'backup',
  'post',
  'remove',
  'search',
  'edited-message-text',
  'kpp',
]) {
  /**
   * @returns {object}
   */
  module.exports[api] = require('./' + api);
}
