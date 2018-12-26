const {NALOGRU_EMAIL, NALOGRU_NAME, NALOGRU_PHONE, NALOGRU_KP_PASSWORD} = require('../env');
const {get, post} = require('../services/request.service');
// TODO: (нужен отдельный мидлварь для фейковых данных)
/* fake device_id */
const DEVICE_ID = 'curl';
/* face device_os */
const DEVICE_OS = 'linux';
/**
 * @description - получаем пароль NALOGRU_KP_PASSWORD на мобильный телефон в виде СМС
 * @returns {Promise}
 */
const kpSignUp = async () => {
  return await post('https://proverkacheka.nalog.ru:9999/v1/mobile/users/signup', {
    email: NALOGRU_EMAIL,
    name: NALOGRU_NAME,
    phone: NALOGRU_PHONE,
  });
};
/**
 * @param {Object} obj - obj
 * @param {string} obj.FN - номер фискального накопителя (aka: 8710000101700xxx)
 * @param {string} obj.FD - Номер фискального документа - ФД (aka: 2360xx)
 * @param {string} obj.FDP - fiscalSign (aka: 3891955xxx)
 * @returns {Object}
 */
const getKPPData = async ({ FN, FD, FDP }) => {
  const data = await get(`https://${NALOGRU_PHONE}:${NALOGRU_KP_PASSWORD}@proverkacheka.nalog.ru:9999/v1/inns/*/kkts/*/fss/${FN}/tickets/${FD}?fiscalSign=${FDP}&sendToEmail=${'no'}`, {
    'Device-Id': DEVICE_ID,
    'Device-OS': DEVICE_OS,
  });
  const formatData = JSON.parse(data.toString('utf8'));
  const {items, user, totalSum, dateTime, retailPlaceAddress} = formatData.document.receipt;
  return {
    items,
    user,
    totalSum,
    dateTime,
    retailPlaceAddress,
  };
};
module.exports = {
  getKPPData,
  kpSignUp,
};
