const jsonrpc = require('jsonrpc-lite');
const format = require('date-fns/format');
const fromUnixTime = require('date-fns/fromUnixTime');
const mailService = require('../../services/mail.service');
const VzorService = require('../../services/vzor.service');

module.exports = async (requestObject) => {
  try {
    // доставляем письмо
    const message = await mailService.create(requestObject);
    // находим письмо
    const since = format(fromUnixTime(message.sendAt), 'MMM dd, yyyy'); // текущий RFC позволяет искать только так
    // todo нужно еще сильнее ограничить поиск. Использовать для этого другие флаги или текстовый поиск по subject в который добавить timestamp
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
