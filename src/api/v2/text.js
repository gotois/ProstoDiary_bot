const jsonrpc = require('jsonrpc-lite');
const AbstractText = require('../../models/abstract/abstract-text');

module.exports = async (requestObject) => {
  const {
    buffer,
    date,
    telegram_user_id,
    telegram_message_id,
    email_message_id,
    publisher,
    creator,
  } = requestObject.params;
  const abstract = new AbstractText(buffer, date);
  abstract.creator = creator;
  abstract.publisher = publisher;
  abstract.telegram_message_id = telegram_message_id;
  abstract.telegram_user_id = telegram_user_id;
  abstract.email_message_id = email_message_id;
  try {
    await abstract.save();
    return jsonrpc.success(requestObject.id, '✅');
  } catch (error) {
    return jsonrpc.error(requestObject.id, new jsonrpc.JsonRpcError(error, 99));
  }
};
