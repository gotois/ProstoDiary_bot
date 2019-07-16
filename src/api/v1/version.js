const {
  projectVersion,
  getCheckSum,
} = require('../../services/version.service');
const { IS_PRODUCTION } = require('../../env');

module.exports = () => {
  let text = '';
  text += projectVersion;
  if (!IS_PRODUCTION) {
    text += ' - development';
  }
  text += ' ' + getCheckSum();
  return text;
};
