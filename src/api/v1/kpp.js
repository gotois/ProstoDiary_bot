const kppService = require('../../services/kpp.service');

module.exports = async (text) => {
  const kppDataResult = await kppService(text);
  return JSON.stringify(kppDataResult, null, 2);
};
