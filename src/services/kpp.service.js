const { NALOGRU } = require('../env');
const { get, post } = require('./request.service');
const fakeService = require('./faker.service');
const qr = require('./qr.service');
/**
 * NALOGRU_HOST
 * @type {string}
 */
const NALOGRU_HOST = 'proverkacheka.nalog.ru';
/**
 * NALOGRU_PORT
 * @type {string}
 */
const NALOGRU_PORT = '9999';
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
const nalogRuSignUp = async () => { // eslint-disable-line
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
const checkKPP = async ({ FN, FD, FDP, TYPE, DATE, SUM }) => {
  // TODO: Если падает ошибка 406 - значит не совпадает номер телефона
  // нужно учитывать такой кейс и давать правильную ошибку
  await get(
    `https://${NALOGRU_HOST}:${NALOGRU_PORT}/v1/ofds/*/inns/*/fss/${FN}/operations/${TYPE}/tickets/${FD}?fiscalSign=${FDP}&date=${DATE}&sum=${SUM}`,
  );
};
/**
 * @param {Buffer} data - buffer data
 * @returns {Object|Error}
 */
const getKPPDocumentReceipt = (data) => {
  const formatData = data.toString('utf8');
  if (typeof formatData !== 'string') {
    throw new Error('KPP: API unknown data');
  } else if (formatData === '' || !formatData.length) {
    // TODO: такое бывает когда их апи не просасывается, надо повторить запро
    throw new Error('KPP: API empty data');
  } else if (formatData === 'illegal public api usage') {
    throw new Error('KPP: API ' + formatData);
  } else if (
    formatData[0] !== '{' ||
    formatData[formatData.length - 1] !== '}'
  ) {
    throw new Error('KPP: API data is not JSON: ' + formatData);
  }
  // TODO: что-то здесь падает. Нужно детектить ошибку и возможно делать nalogRuSignUp
  // падает с SyntaxError: Unexpected end of JSON input
  const formatDataObject = JSON.parse(formatData);
  if (!formatDataObject.document || !formatDataObject.document.receipt) {
    throw new Error('KPP: document or receipt not found');
  }
  return formatDataObject.document.receipt;
};
/**
 * @param {Object} kppParams - параметры KPP
 * @returns {{items: *, user: *, totalSum: *, dateTime: *, retailPlaceAddress: *}}
 */
const getKPPData = async ({ FN, FD, FDP }) => {
  const fakeDevice = new fakeService.Device();
  const data = await get(
    `https://${NALOGRU.NALOGRU_PHONE}:${
      NALOGRU.NALOGRU_KP_PASSWORD
    }@${NALOGRU_HOST}:${NALOGRU_PORT}/v1/inns/*/kkts/*/fss/${FN}/tickets/${FD}?fiscalSign=${FDP}&sendToEmail=${'no'}`,
    {
      'Device-Id': fakeDevice.DEVICE_ID,
      'Device-OS': fakeDevice.DEVICE_OS,
    },
  );
  const kppDocumentReceipt = getKPPDocumentReceipt(data);
  return kppDocumentReceipt;
};
/**
 * @param {string} query - query
 * @returns {Object}
 */
const getQRParams = (query) => {
  return (/^[?#]/.test(query) ? query.slice(1) : query)
    .split('&')
    .reduce((params, param) => {
      const [key, value] = param.split('=');
      params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
      return params;
    }, {});
};
/**
 * @param {Buffer|Object|string} input - input
 * @returns {Promise<Object|Error>}
 */
const getKPPParams = async (input) => {
  let qrString = '';
  switch (typeof input) {
    case 'string': {
      if (!input.length) {
        throw new Error('KPP: input is 0 length');
      }
      qrString = input;
      break;
    }
    case 'Buffer': {
      qrString = await qr.readQR(input);
      break;
    }
    case 'object': {
      if (input === null) {
        throw new Error('KPP: input is null');
      }
      break;
    }
    default: {
      throw new Error('KPP: wrong input');
    }
  }
  qrString = qrString.trim();
  const kppParams = getQRParams(qrString);
  const normalizeKPPParams = formatArguments(kppParams);
  return normalizeKPPParams;
};
/**
 * @param {Buffer|Object|string} input - input
 * @returns {Promise<Object>}
 */
const kppService = async (input) => {
  const kppParams = await getKPPParams(input);
  // STEP 1 - авторизуемся
  // TODO: uncomment this if getKPPData doesn't work
  // await nalogRuSignUp()
  // STEP 2 - проверяем чек (необходимо чтобы избежать ошибки illegal api)
  await checkKPP(kppParams);
  // STEP 3 - используем данные для получения подробного результата
  const kppData = await getKPPData(kppParams);
  return kppData;
};

module.exports = kppService;
