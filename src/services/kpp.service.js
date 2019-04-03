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
    'https://proverkacheka.nalog.ru:8888/v1/mobile/users/signup',
    {
      name: NALOGRU_NAME,
      email: NALOGRU_EMAIL,
      phone: NALOGRU_PHONE,
    },
  );
  return res;
};
/**
 * @param {string} FN - Номер ФН (Фискальный Номер) — 16-значный номер. Например 8710000100518392
 * @param {string} FD - Номер ФД (Фискальный документ) — до 10 знаков. Например 54812
 * @param {string} FDP - Номер ФПД (Фискальный Признак Документа, также известный как ФП) — до 10 знаков. Например 3522207165
 * @param {string} TYPE - Вид кассового чека. В чеке помечается как n=1 (приход) и n=2 (возврат прихода)
 * @param {string} DATE - Дата — дата с чека. Формат может отличаться. Я пробовал переворачивать дату (т.е. 17-05-2018), ставить вместо Т пробел, удалять секунды
 * @param {string} SUM - Сумма — сумма с чека в копейках - 3900
 * @returns {Promise<undefined>}
 */
const checkKPP = async ({ FN, FD, FDP, TYPE, DATE, SUM }) => {
  // TODO: это перевести в getParams в qr.service.js
  SUM = SUM.replace('.', '');
  FN = Number(FN);
  FD = Number(FD);
  FDP = Number(FDP);
  TYPE = Number(TYPE);
  // END
  await get(
    `https://proverkacheka.nalog.ru:9999/v1/ofds/*/inns/*/fss/${FN}/operations/${TYPE}/tickets/${FD}?fiscalSign=${FDP}&date=${DATE}&sum=${SUM}`,
  );
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
  checkKPP,
  nalogRuSignUp,
};
