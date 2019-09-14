const bot = require('../core');
const logger = require('../services/logger.service');
const { getTelegramFile } = require('../services/telegram-file.service');
const APIv2 = require('../api/v2');
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
  const fileBuffer = await getTelegramFile(document.file_id);
  const { error, result } = await APIv2.insert(fileBuffer, {});
  if (error) {
    logger.error(error);
    await bot.sendMessage(chatId, 'unknown mime format');
    return;
  }
  await bot.sendMessage(chatId, result);
};

module.exports = getDocument;
