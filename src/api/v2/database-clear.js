const jsonrpc = require('jsonrpc-lite');
const dbEntries = require('../../database/entities.database');
/**
 * @todo дать возможность очищать только определенные данные из истории
 * @param {RequestObject} requestObject - requestObject
 * @returns {JsonRpc|JsonRpcError}
 */
module.exports = async (requestObject) => {
  try {
    await dbEntries.clear(requestObject.params.userId);
    return jsonrpc.success(requestObject.id, 'Данные очищены');
  } catch (error) {
    return jsonrpc.error(requestObject.id, new jsonrpc.JsonRpcError(error, 99));
  }
};
