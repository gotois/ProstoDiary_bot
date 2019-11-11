const { get } = require('../services/request.service');
const HOST = 'login.yandex.ru';

const passportInfo = async (accessToken) => {
  const response = await get(`https://${HOST}/info`, {
    format: 'json',
  }, {
    Authorization: `OAuth ${accessToken}`
  }, 'utf8');
  return response;
};

module.exports = {
  passportInfo,
};
