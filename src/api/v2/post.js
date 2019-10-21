const jsonrpc = require('jsonrpc-lite');
const format = require('date-fns/format');
const fromUnixTime = require('date-fns/fromUnixTime');
const mailService = require('../../services/mail.service');
const VzorService = require('../../services/vzor.service');
/**
 * @param {RequestObject} requestObject - requestObject
 * @returns {Promise<JsonRpc|JsonRpcError>}
 */
module.exports = async (requestObject) => {
  if (!requestObject.params.date) {
    requestObject.params.date = Math.round(new Date().getTime() / 1000);
  }
  try {
    // отправляем письмо
    const message = await mailService.post(requestObject);
    const since = format(fromUnixTime(message.sendAt), 'MMM dd, yyyy'); // текущий RFC позволяет искать только по дате
    // todo использовать поиск по subject
    // находим письмо
    const mailMap = await VzorService.search(['UNSEEN', ['SINCE', since]]);
    // считываем его содержимое и записываем в БД
    mailMap.forEach(async (mail) => {
      await mailService.read(mail);
    });
    return jsonrpc.success(requestObject.id, '✅');
  } catch (error) {
    return jsonrpc.error(requestObject.id, new jsonrpc.JsonRpcError(error, 99));
  }
};
