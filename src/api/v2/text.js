const jsonrpc = require('jsonrpc-lite');
const AbstractText = require('../../models/abstract/abstract-text');

module.exports = async (requestObject) => {
  const {
    buffer,
    date,
    mime,
    telegram_user_id,
    telegram_message_id,
    email_message_id,
    publisher,
    creator,
  } = requestObject.params;
  const abstractText = new AbstractText(buffer, mime, date);
  abstractText.creator = creator;
  abstractText.publisher = publisher;
  abstractText.telegram_message_id = telegram_message_id;
  abstractText.telegram_user_id = telegram_user_id;
  abstractText.email_message_id = email_message_id;
  try {
    await abstractText.commit();
    return jsonrpc.success(requestObject.id, '✅');
  } catch (error) {
    return jsonrpc.error(requestObject.id, new jsonrpc.JsonRpcError(error, 99));
  }
};
