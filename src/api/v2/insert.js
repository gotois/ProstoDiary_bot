const fileType = require('file-type');
const { IS_CI } = require('../../environment');
const Story = require('../../services/story.service');
const { unpack } = require('../../services/archive.service');

// todo: поместить в middleware
const foodService = require('../../services/food.service');
const kppService = require('../../services/kpp.service');
const {
  uploadAppleHealthData,
} = require('../../services/apple-health.service');
const { readOFX } = require('../../services/tinkoff.service');
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
  if (Buffer.byteLength(buffer) === 0) {
    throw new Error('Empty buffer');
  }
  const story = new Story(buffer, {
    date,
    telegram_user_id: currentUser.id,
    telegram_message_id,
  });
  const type = fileType(buffer);
  switch (type && type.mime) {
    case 'image/png':
    case 'image/jpeg': {
      story.type = 'HARD';
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
      story.type = 'HARD';
      // todo: парсинг ofx
      const ofxResult = await readOFX(buffer);
      // ofxResult.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKACCTFROM
      throw new Error('XML in progress');
    }
    case 'application/pdf': {
      story.type = 'HARD';
      throw new Error('PDF in progress');
    }
    case 'application/zip':
    case 'multipart/x-zip': {
      story.type = 'HARD';
      const zipContents = await unpack(buffer);
      // todo: перенести в middleware
      for await (const [fileName, zipBuffer] of zipContents) {
        if (fileName === 'apple_health_export/export.xml') {
          throw new Error('Apple Health in progress');

          // const healthObject = await uploadAppleHealthData(zipBuffer);
          // return {
          //   jsonrpc: '2.0',
          //   result:
          //     'export apple health from ' +
          //     healthObject.HealthData.ExportDate.value,
          // };
        }
      }
      break;
    }
    default: {
      throw new Error('unknown format format');
    }
  }
  return story;
};
/**
 * @description весь pipe работы с input - вставка и разбор логики voice, text, photo, document
 * @param {Buffer} buffer - input
 * @param {object} options - options
 * @returns {jsonrpc}
 */
module.exports = async (
  buffer,
  {
    date,
    currentUser,
    telegram_message_id,
    caption, // необязательный аттрибут, который явно задает что делать
  } = {},
) => {
  try {
    const inputStory = await inputSaver(
      buffer,
      caption,
      date,
      currentUser,
      telegram_message_id,
    );
    if (!IS_CI) {
      await inputStory.save();
    }
    return {
      jsonrpc: '2.0',
      result: 'SAVED',
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      error: {
        message: error.message.toString(),
      },
    };
  }
};
