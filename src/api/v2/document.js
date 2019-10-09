const jsonrpc = require('jsonrpc-lite');
const AbstractDocument = require('../../models/abstract/abstract-document');

module.exports = async (requestObject) => {
  const { buffer, mime, date } = requestObject.params;
  try {
    const abstractDocument = new AbstractDocument(buffer, mime, date);
    await abstractDocument.commit();
    return jsonrpc.success(requestObject.id, '✅');
  } catch (error) {
    return jsonrpc.error(requestObject.id, new jsonrpc.JsonRpcError(error, 99));
  }
};
