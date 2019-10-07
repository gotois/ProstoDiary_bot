const jsonrpc = require('jsonrpc-lite');
const AbstractDocument = require('../../models/abstract/abstract-document');

module.exports = async (requestObject) => {
  const { buffer, date } = requestObject.params;
  try {
    const abstract = new AbstractDocument(buffer, date);
    await abstract.save();
    return jsonrpc.success(requestObject.id, '✅');
  } catch (error) {
    return jsonrpc.error(requestObject.id, new jsonrpc.JsonRpcError(error, 99));
  }
};
