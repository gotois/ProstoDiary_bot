/**
 * @description Проверка ping
 * @param {object} parameters - jsonrpc params
 * @param {?object} passport - auth
 * @returns {Promise<string>}
 */
module.exports = function(parameters, { passport }) {
  // eslint-disable-next-line
  passport;
  return Promise.resolve('pong');
};
