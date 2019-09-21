const { unpack } = require('./archive.service');


// todo: поместить в middleware
const foodService = require('./food.service');
const kppService = require('./kpp.service');
const {
  uploadAppleHealthData,
} = require('./apple-health.service');
const { readOFX } = require('./tinkoff.service');
// endtodo



/**
 * @todo добавить легкую возможность расширять сохранение используя сторонние мидлвары (QR, etc). Мидлвары сразу напрямую добавляют данные в историю
 * @param {Buffer} buffer - buffer text or photo or document
 * @param {string|undefined} caption - caption
 * @returns {Promise<Story>}
 */
const inputSaver = async (
  buffer,
  caption,
  date,
  currentUser,
  telegram_message_id,
) => {
  
  // const story = new Story(buffer, {
  //   date,
  //   telegram_user_id: currentUser.id,
  //   telegram_message_id,
  // });
  
  switch (type && type.mime) {
    case 'plain/text': {
      break;
    }
    case 'image/png':
    case 'image/jpeg': {
      // story.type = 'HARD';
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
      break;
    }
    case 'application/xml': {
      // story.type = 'HARD';
      // todo: парсинг ofx
      // const ofxResult = await readOFX(buffer);
      // ofxResult.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKACCTFROM
      throw new Error('XML in progress');
    }
    case 'application/pdf': {
      // story.type = 'HARD';
      throw new Error('PDF in progress');
    }
    case 'application/zip':
    case 'multipart/x-zip': {
      // story.type = 'HARD';
      // const zipContents = await unpack(buffer);
      // todo: перенести в middleware
      // for await (const [fileName, zipBuffer] of zipContents) {
      //   if (fileName === 'apple_health_export/export.xml') {
      //     throw new Error('Apple Health in progress');
      //
      //     // const healthObject = await uploadAppleHealthData(zipBuffer);
      //   }
      // }
      break;
    }
    default: {
      break;
    }
  }
  
  

  

  return story;
};

module.exports = inputSaver;
