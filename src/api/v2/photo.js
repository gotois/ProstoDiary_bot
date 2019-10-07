const jsonrpc = require('jsonrpc-lite');
const AbstractPhoto = require('../../models/abstract/abstract-photo');

module.exports = async (requestObject) => {
  const { buffer, date } = requestObject.params;
  const abstract = new AbstractPhoto(buffer, date);
  try {
    await abstract.save();
    return jsonrpc.success(requestObject.id, '✅');
  } catch (error) {
    return jsonrpc.error(requestObject.id, new jsonrpc.JsonRpcError(error, 99));
  }
};
