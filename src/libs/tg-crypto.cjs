const crypto = require('crypto');
const { TELEGRAM } = require('../environments/index.cjs');

module.exports.generateTelegramHash = (data) => {
  const checkString = Object.keys(data)
    .filter((key) => {
      return key !== 'hash';
    })
    .map((key) => {
      return `${key}=${data[key]}`;
    })
    .sort()
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(TELEGRAM.TOKEN).digest();
  return crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
};
