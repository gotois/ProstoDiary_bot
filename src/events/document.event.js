const bot = require('../bot');
const logger = require('../services/logger.service');
const { uploadAppleHealthData } = require('../services/apple-health.service');
const { getTelegramFile } = require('../services/telegram-file.service');
const { unpack } = require('../services/archive.service');
/**
 * @function
 * @param {object} msg - msg
 * @param {object} msg.chat - chat
 * @param {object} msg.document - document
 * @description пример считывания zip архива; его распаковка; нахождение export.xml и его превращение в json
 * @returns {Promise<undefined>}
 */
const getDocument = async ({ chat, document }) => {
  logger.log('info', getDocument.name);
  const chatId = chat.id;
  if (['application/zip', 'multipart/x-zip'].includes(document.mime_type)) {
    try {
      const fileBuffer = await getTelegramFile(document.file_id);
      const zipContents = await unpack(fileBuffer);
      for await (const [fileName, buffer] of zipContents) {
        if (fileName === 'apple_health_export/export.xml') {
          const healthObject = await uploadAppleHealthData(buffer);
          await bot.sendMessage(
            chatId,
            'export apple health from ' +
              healthObject.HealthData.ExportDate.value,
          );
        }
      }
      await bot.sendMessage(chatId, 'test: document upload done');
    } catch (error) {
      logger.log('error', error.toString());
      await bot.sendMessage(chatId, 'Распознавание документа неудачно');
    }
    return;
  }
  await bot.sendMessage(chatId, 'unknown mime format');
};

module.exports = getDocument;
