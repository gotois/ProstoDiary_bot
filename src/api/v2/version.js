const {
  projectVersion,
  getCheckSum,
} = require('../../services/version.service');
const jsonrpc = require('jsonrpc-lite');
const { IS_PRODUCTION } = require('../../environment');
/**
 * @param {RequestObject} requestObject - requestObject
 * @returns {JsonRpc}
 */
module.exports = (requestObject) => {
  let text = '';
  text += projectVersion;
  if (IS_PRODUCTION) {
    text += ' - production\n';
  }
  text += ' \n' + getCheckSum();
  return jsonrpc.success(requestObject.id, text);
};
