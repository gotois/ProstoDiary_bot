const jsonrpc = require('jsonrpc-lite');
/**
 * @returns {JsonRpc}
 */
module.exports = () => {
  return jsonrpc.notification('pong');
};
