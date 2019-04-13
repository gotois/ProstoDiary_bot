const bot = require('../bot');
const logger = require('../services/logger.service');
const { get } = require('../services/request.service');
const qr = require('../services/qr.service');
const visionService = require('../services/vision.service');
const {
  checkKPP,
  // nalogRuSignUp,
  getKPPData,
} = require('../services/kpp.service');
/**
 * @description Работа с QR
 * @param {Object} msg - message
 * @param {Object} msg.chat - chat
 * @param {Array} msg.photo - photo
 * @returns {Promise<undefined>}
 */
const onPhoto = async ({ chat, /*date, from, message_id,*/ photo }) => {
  logger.log('info', onPhoto.name);
  const chatId = chat.id;
  const [smallPhoto, mediumPhoto, largePhoto, originalPhoto] = photo; // eslint-disable-line no-unused-vars
  if (!mediumPhoto.file_id) {
    throw new Error('Wrong file');
  }
  const fileInfo = await bot.getFile(mediumPhoto.file_id);
  // TODO: сделать обертку для выбора файла из телеграм
  const buffer = await get(
    `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`,
  );
  // TODO: нужно обернуть в try/catch
  const visionResult = await visionService.labelDetection(buffer);
  if (!visionService.isQR(visionResult)) {
    await bot.sendMessage(chatId, 'QR not found');
    return;
  }
  try {
    const qrParams = await qr.readQR(buffer);
    // STEP 1 - авторизуемся
    // TODO: uncomment this if getKPPData doesn't work
    // await nalogRuSignUp()

    // STEP 2 - проверяем чек (необходимо чтобы избежать ошибки illegal api)
    await checkKPP(qrParams);

    // STEP 3 - используем данные для получения подробного результата
    // TODO: данные должны попадать в БД
    const kppData = await getKPPData(qrParams);
    await bot.sendMessage(chatId, JSON.stringify(kppData, null, 2));
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, error.toString());
  }
};

module.exports = onPhoto;
