const { getTelegramFile } = require('../services/telegram-file.service');
const { getPhotoDetection } = require('../services/photo.service');
const foodService = require('../services/food.service');
const kppService = require('../services/kpp.service');

module.exports = async (photo, caption) => {
  const fileBuffer = await getTelegramFile(photo.file_id);
  const { isQR } = await getPhotoDetection({
    caption: caption,
    fileBuffer: fileBuffer,
  });
  if (isQR) {
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
    return JSON.stringify(
      {
        kpp: kppData,
        food: foodText,
      },
      null,
      2,
    );
  }
  return 'Unknown photo';
};
