const jsonrpc = require('jsonrpc-lite');
const AbstractPhoto = require('../../models/abstract/abstract-photo');

module.exports = async (requestObject) => {
  const { buffer, mime, date } = requestObject.params;
  const abstractPhoto = new AbstractPhoto(buffer, mime, date);
  try {
    await abstractPhoto.commit();
    return jsonrpc.success(requestObject.id, '✅');
  } catch (error) {
    return jsonrpc.error(requestObject.id, new jsonrpc.JsonRpcError(error, 99));
  }
};
