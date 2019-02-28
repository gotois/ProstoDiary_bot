const {
  NALOGRU_EMAIL,
  NALOGRU_NAME,
  NALOGRU_PHONE,
  NALOGRU_KP_PASSWORD,
} = require('../env');
const logger = require('./logger.service');
const { get, post } = require('./request.service');
// TODO: (нужен отдельный мидлварь для фейковых данных)
/* fake device_id */
const DEVICE_ID = 'curl';
/* face device_os */
const DEVICE_OS = 'linux';
/**
 * @description - получаем пароль NALOGRU_KP_PASSWORD на мобильный телефон в виде СМС
 * @returns {Promise}
 */
const nalogRuSignUp = async () => {
  const res = await post(
    'https://proverkacheka.nalog.ru:9999/v1/mobile/users/signup',
    {
      name: NALOGRU_NAME,
      email: NALOGRU_EMAIL,
      phone: NALOGRU_PHONE,
    },
  );
  return res;
};
/**
 * @param {Object} obj - obj
 * @param {string} obj.FN - номер фискального накопителя (aka: 8710000101700xxx)
 * @param {string} obj.FD - Номер фискального документа - ФД (aka: 2360xx)
 * @param {string} obj.FDP - fiscalSign (aka: 3891955xxx)
 * @returns {Object}
 */
const getKPPData = async ({ FN, FD, FDP }) => {
  const data = await get(
    `https://${NALOGRU_PHONE}:${NALOGRU_KP_PASSWORD}@proverkacheka.nalog.ru:9999/v1/inns/*/kkts/*/fss/${FN}/tickets/${FD}?fiscalSign=${FDP}&sendToEmail=${'no'}`,
    {
      'Device-Id': DEVICE_ID,
      'Device-OS': DEVICE_OS,
    },
  );
  const formatData = data.toString('utf8');
  let formatDataObject;
  if (formatData === 'illegal public api usage') {
    logger.log('error', formatData);
    throw new Error('KPP:API');
  }
  try {
    formatDataObject = JSON.parse(formatData);
  } catch (error) {
    logger.log('error', error.toString());
    throw new Error('KPP:Parse');
  }
  const {
    items,
    user,
    totalSum,
    dateTime,
    retailPlaceAddress,
  } = formatDataObject.document.receipt;
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
  nalogRuSignUp,
};
