const bot = require('../bot');
const logger = require('../services/logger.service');
const { getTelegramFile } = require('../services/telegram-file.service');
const { getPhotoDetection } = require('../services/photo.service');
const foodService = require('../services/food.service');
const kppService = require('../services/kpp.service');
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
      const kppData = await kppService(fileBuffer);
      // TODO: данные kppData должны попадать в БД
      // выявляем из данных нужное
      let foodText = '';
      // TODO: получаем данные о еде, узнаем количество потраченных денег, время покупки, etc
      for (const item of kppData.items) {
        const { food_description, food_name } = await foodService.search(
          item.name,
        );
        // item.quantity // здесь как количество, так и граммы могут быть
        foodText += `\n${item.name}_${food_name}_: ${food_description}`;
      }
      await bot.sendMessage(chatId, JSON.stringify(kppData, null, 2));
      await bot.sendMessage(chatId, foodText, {
        parse_mode: 'Markdown',
      });
    } catch (error) {
      logger.log('error', error.toString());
      await bot.sendMessage(chatId, error.toString());
    }
  }
};

module.exports = onPhoto;
