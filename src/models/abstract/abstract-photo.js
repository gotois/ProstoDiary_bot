const Abstract = require('./');
// const { getPhotoDetection } = require('../services/photo.service');
const kppService = require('../../services/kpp.service');
const foodService = require('../../services/food.service');

class AbstractPhoto extends Abstract {
  #caption;
  
  constructor(buffer, caption) {
    super(buffer);
    this.#caption = caption;
  }
  
  async fill () {
    const { isQR } = await getPhotoDetection({
      caption: this.#caption,
      fileBuffer: this.buffer,
    });
    if (isQR) {
      const kppData = await kppService(this.buffer);
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
