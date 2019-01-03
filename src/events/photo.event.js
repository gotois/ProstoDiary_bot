const bot = require('../config');
const logger = require('../services/logger.service');
const {get} = require('../services/request.service');
const qr = require('../services/qr.service');
const {getParams} = require('../services/params.service');
const {
  // nalogRuSignUp,
  getKPPData
} = require('../services/kpp.service');
/**
 * @description Работа с QR
 * @param {Object} msg - message
 * @param {Object} msg.chat - chat
 * @param {Array} msg.photo - photo
 * @returns {Promise<undefined>}
 */
const onPhoto = async ({chat, /*date, from, message_id,*/photo}) => {
  logger.log('info', onPhoto.name);
  const chatId = chat.id;
  const fileInfo = await bot.getFile(photo[photo.length - 1].file_id);
  
  try {
    const buffer = await get(`https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`);
    const qrResult = await qr(buffer);
    const params = getParams(qrResult);
    // todo: авторизуемся uncomment this if getKPPData doesn't work
    // await nalogRuSignUp()
    // используем данные для получения подробного результата:
    // TODO: данные должны попадать в БД
    const kppData = await getKPPData({
      FN: params.fn,
      FD: params.i,
      FDP: params.fp
    });
    await bot.sendMessage(chatId, JSON.stringify(kppData, null, 2));
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, error.toString());
  }
};

module.exports = onPhoto;
