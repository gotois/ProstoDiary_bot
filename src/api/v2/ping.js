const jsonrpc = require('jsonrpc-lite');
/**
 * @param {RequestObject} requestObject - requestObject
 * @returns {JsonRpc}
 */
module.exports = (requestObject) => {
  return jsonrpc.success(requestObject.id, 'pong');
};
