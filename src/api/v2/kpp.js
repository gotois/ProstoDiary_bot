const jsonrpc = require('jsonrpc-lite');
const kppService = require('../../services/kpp.service');
const AbstractDocument = require('../../models/abstract/abstract-document');
/**
 * @param {RequestObject} requestObject - requestObject
 * @returns {JsonRpc|JsonRpcError}
 */
module.exports = async (requestObject) => {
  const { text } = requestObject.params;
  try {
    const kppDataResult = await kppService(text);
    // todo добавлять это в Abstract document
    //  const abstractDocument = new AbstractDocument();
    //  ...
    return jsonrpc.success(requestObject.id, kppDataResult);
  } catch (error) {
    return jsonrpc.error(requestObject.id, new jsonrpc.JsonRpcError(error, 99));
  }
};
