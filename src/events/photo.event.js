const bot = require('../bot');
const logger = require('../services/logger.service');
const qr = require('../services/qr.service');
const { getTelegramFile } = require('../services/telegram-file.service');
const { getPhotoDetection } = require('../services/photo.service');
const {
  checkKPP,
  // nalogRuSignUp,
  getKPPData,
} = require('../services/kpp.service');
/**
 * @description Работа с QR
 * @param {Object} msg - message
 * @param {Object} msg.chat - chat
 * @param {Array<Object>} msg.photo - photo
 * @param {string} msg.caption - caption
 * @returns {Promise<undefined>}
 */
const onPhoto = async ({ chat, photo, caption }) => {
  logger.log('info', onPhoto.name);
  const chatId = chat.id;
  // TODO: тоже перенести в обертку для выбора файла из телеги
  const [smallPhoto, mediumPhoto, largePhoto, originalPhoto] = photo; // eslint-disable-line no-unused-vars
  if (!mediumPhoto.file_id) {
    throw new Error('Wrong file');
  }
  const fileBuffer = await getTelegramFile(mediumPhoto.file_id);
  const { isQR } = await getPhotoDetection({
    caption: caption,
    fileBuffer: fileBuffer,
  });
  if (isQR) {
    try {
      const qrParams = await qr.readQR(fileBuffer);
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
  }
};

module.exports = onPhoto;
