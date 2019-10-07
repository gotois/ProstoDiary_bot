const jsonrpc = require('jsonrpc-lite');
const dbEntries = require('../../database/entities.database');
/**
 * @param {RequestObject} requestObject - requestObject
 * @returns {JsonRpc|JsonRpcError}
 */
module.exports = async (requestObject) => {
  const { message_id, user } = requestObject.params;
  try {
    await dbEntries.delete(user.id, message_id);
    return jsonrpc.success(requestObject.id, 'Запись удалена');
  } catch (error) {
    return jsonrpc.error(requestObject.id, new jsonrpc.JsonRpcError(error, 99));
  }
};
