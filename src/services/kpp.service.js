const { NALOGRU } = require('../env');
const logger = require('./logger.service'); // TODO: в сервисах не должно быть логирования
const { get, post } = require('./request.service');
const fakeService = require('./faker.service');
/**
 * NALOGRU_HOST
 * @type {string}
 */
const NALOGRU_HOST = 'proverkacheka.nalog.ru';
/**
 * @param {Object} qrParams - qr params
 * @param {string} qrParams.fn - Номер ФН (Фискальный Номер) — 16-значный номер. Например 8710000101700xxx
 * @param {string} qrParams.i - Номер ФД (Фискальный документ) — до 10 знаков. Например 2360xx
 * @param {string} qrParams.fp - Номер ФПД (Фискальный Признак Документа, также известный как ФП) — до 10 знаков. Например 3891955xxx
 * @param {string} qrParams.n - Вид кассового чека. В чеке помечается как n=1 (приход) и n=2 (возврат прихода)
 * @param {string} qrParams.t - Дата — дата с чека. Формат может отличаться. Я пробовал переворачивать дату (т.е. 17-05-2018), ставить вместо Т пробел, удалять секунды
 * @param {string} qrParams.s - Сумма — сумма с чека в копейках - 3900
 * @returns {{DATE: string, SUM: string, FN: number, FD: number, FDP: number, TYPE: number}}
 */
const formatArguments = (qrParams) => {
  const DATE = String(qrParams.t);
  const SUM = String(qrParams.s).replace('.', '');
  const FN = Number(qrParams.fn);
  const FD = Number(qrParams.i);
  const FDP = Number(qrParams.fp);
  const TYPE = Number(qrParams.n);
  return {
    DATE,
    SUM,
    FN,
    FD,
    FDP,
    TYPE,
  };
};
/**
 * @description - получаем пароль NALOGRU_KP_PASSWORD на мобильный телефон в виде СМС
 * @returns {Promise}
 */
const nalogRuSignUp = async () => {
  // TODO: не ясно почему здесь отличается порт
  const res = await post(
    `https://${NALOGRU_HOST}:8888/v1/mobile/users/signup`,
    {
      name: NALOGRU.NALOGRU_NAME,
      email: NALOGRU.NALOGRU_EMAIL,
      phone: NALOGRU.NALOGRU_PHONE,
    },
  );
  return res;
};
/**
 * @param {Object} kppParams - параметры KPP
 * @returns {Promise<undefined>}
 */
const checkKPP = async (kppParams) => {
  const { FN, FD, FDP, TYPE, DATE, SUM } = formatArguments(kppParams);
  await get(
    `https://${NALOGRU_HOST}:9999/v1/ofds/*/inns/*/fss/${FN}/operations/${TYPE}/tickets/${FD}?fiscalSign=${FDP}&date=${DATE}&sum=${SUM}`,
  );
};
/**
 * @param {Object} kppParams - параметры KPP
 * @returns {Object}
 */
const getKPPData = async (kppParams) => {
  const fakeDevice = new fakeService.Device();
  const { FN, FD, FDP } = formatArguments(kppParams);
  const data = await get(
    `https://${NALOGRU.NALOGRU_PHONE}:${
      NALOGRU.NALOGRU_KP_PASSWORD
    }@${NALOGRU_HOST}:9999/v1/inns/*/kkts/*/fss/${FN}/tickets/${FD}?fiscalSign=${FDP}&sendToEmail=${'no'}`,
    {
      'Device-Id': fakeDevice.DEVICE_ID,
      'Device-OS': fakeDevice.DEVICE_OS,
    },
  );
  const formatData = data.toString('utf8');
  let formatDataObject;
  if (formatData === 'illegal public api usage') {
    logger.log('error', formatData);
    throw new Error('KPP:API');
  }
  logger.log('info', formatData);
  try {
    // TODO: что-то здесь падает. Нужно детектить ошибку и возможно делать nalogRuSignUp
    formatDataObject = JSON.parse(formatData);
  } catch (error) {
    logger.log('error', error.toString());
    throw new Error('KPP:Parse');
  }
  if (!formatDataObject.document || !formatDataObject.document.receipt) {
    throw new Error('KPP:Document');
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
