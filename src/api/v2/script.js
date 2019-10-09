const jsonrpc = require('jsonrpc-lite');
const AbstractScript = require('../../models/abstract/abstract-script');

/**
 * @param {RequestObject} requestObject - requestObject
 * @returns {JsonRpc|JsonRpcError}
 */
module.exports = async (requestObject) => {
  const {
    buffer,
    date,
    mime,
    telegram_message_id,
    telegram_bot_id,
    publisher,
    creator,
  } = requestObject.params;
  const abstractScript = new AbstractScript(buffer, mime, date);
  abstractScript.creator = creator;
  abstractScript.publisher = publisher;
  abstractScript.telegram_message_id = telegram_message_id;
  abstractScript.telegram_bot_id = telegram_bot_id;
  try {
    await abstractScript.commit();
    return jsonrpc.success(requestObject.id, '✅');
  } catch (error) {
    return jsonrpc.error(requestObject.id, new jsonrpc.JsonRpcError(error, 99));
  }
};
