const bot = require('../bot');
const logger = require('../services/logger.service');
const documentAPI = require('../api/v1/document');
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
  try {
    const documentResult = await documentAPI(document);
    await bot.sendMessage(chatId, documentResult);
  } catch (error) {
    logger.error(error);
    await bot.sendMessage(chatId, 'unknown mime format');
  }
};

module.exports = getDocument;
