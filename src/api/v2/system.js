const jsonrpc = require('jsonrpc-lite');
const AbstractSystem = require('../../models/abstract/abstract-system');

/**
 * @param {RequestObject} requestObject - requestObject
 * @returns {JsonRpc|JsonRpcError}
 */
module.exports = async (requestObject) => {
  const {
    buffer,
    date,
    telegram_message_id,
    telegram_bot_id,
    publisher,
    creator,
  } = requestObject.params;
  const abstractSystem = new AbstractSystem(buffer, date);
  abstractSystem.creator = creator;
  abstractSystem.publisher = publisher;
  abstractSystem.telegram_message_id = telegram_message_id;
  abstractSystem.telegram_bot_id = telegram_bot_id;
  try {
    await abstractSystem.save();
    return jsonrpc.success(requestObject.id, '✅');
  } catch (error) {
    return jsonrpc.error(requestObject.id, new jsonrpc.JsonRpcError(error, 99));
  }
};
