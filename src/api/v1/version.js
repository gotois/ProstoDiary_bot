const {
  projectVersion,
  getCheckSum,
} = require('../../services/version.service');
const { IS_PRODUCTION } = require('../../environment');
/**
 * @returns {jsonrpc}
 */
module.exports = () => {
  let text = '';
  text += projectVersion;
  if (IS_PRODUCTION) {
    text += ' - production\n';
  }
  text += getCheckSum();
  return {
    jsonrpc: '2.0',
    result: text,
  };
};
