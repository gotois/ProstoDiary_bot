const { NALOGRU } = require('../env');
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
 * @param {Buffer} data - buffer data
 * @returns {Object}
 */
const getKPPDocumentReceipt = (data) => {
  const formatData = data.toString('utf8');
  if (typeof formatData !== 'string') {
    throw new Error('KPP: API unknown data');
  } else if (formatData === '' || !formatData.length) {
    throw new Error('KPP: API empty data');
  } else if (formatData === 'illegal public api usage') {
    throw new Error('KPP: API ' + formatData);
  } else if (
    formatData[0] !== '{' ||
    formatData[formatData.length - 1] !== '}'
  ) {
    throw new Error('KPP: API data is not JSON: ' + formatData);
  }
  let formatDataObject;
  try {
    // TODO: что-то здесь падает. Нужно детектить ошибку и возможно делать nalogRuSignUp
    // падает с SyntaxError: Unexpected end of JSON input
    formatDataObject = JSON.parse(formatData);
  } catch (error) {
    throw new Error('KPP: JSON parse ' + error.toString());
  }
  if (!formatDataObject.document || !formatDataObject.document.receipt) {
    throw new Error('KPP: document or receipt not found');
  }
  return formatDataObject.document.receipt;
};
/**
 * @param {Object} kppParams - параметры KPP
 * @returns {{items: *, user: *, totalSum: *, dateTime: *, retailPlaceAddress: *}}
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
  const kppDocumentReceipt = getKPPDocumentReceipt(data);
  return kppDocumentReceipt;
};
module.exports = {
  getKPPData,
  checkKPP,
  nalogRuSignUp,
};
