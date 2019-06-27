const bot = require('../bot');
const logger = require('../services/logger.service');
const { uploadAppleHealth } = require('../services/apple-health.service');
const { getTelegramFile } = require('../services/telegram-file.service');
/**
 * @function
 * @param {object} msg - msg
 * @param {object} msg.chat - chat
 * @param {object} msg.document - document
 * @returns {Promise<undefined>}
 */
const getDocument = async ({ chat, document }) => {
  logger.log('info', getDocument.name);
  const chatId = chat.id;
  try {
    if (document.mime_type === 'multipart/x-zip') {
      const fileBuffer = await getTelegramFile(document.file_id);
      // TODO: здесь в будущем будет свитчер aka if (appleHelathZip)...
      await uploadAppleHealth(fileBuffer);
      await bot.sendMessage(chatId, 'test:done');
    } else {
      await bot.sendMessage(chatId, 'unknown mime format');
    }
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, 'Распознавание документа неудачно');
  }
};

module.exports = getDocument;
