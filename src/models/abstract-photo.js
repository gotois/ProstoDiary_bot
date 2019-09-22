const Abstract = require('./abstract');

class AbstractPhoto extends Abstract {
  #image;
  
  async fill () {
    const { getPhotoDetection } = require('../../services/photo.service');
    
    const { isQR } = await getPhotoDetection({
      caption: caption,
      fileBuffer: buffer,
    });
    if (isQR) {
      const kppData = await kppService(buffer);
      // это мидлваре для изображений
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
    }
  }
}

module.exports = AbstractPhoto;
