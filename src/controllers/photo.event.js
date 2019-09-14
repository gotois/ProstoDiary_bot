const bot = require('../core');
const logger = require('../services/logger.service');
const { getTelegramFile } = require('../services/telegram-file.service');
const APIv2 = require('../api/v2');
/**
 * @param {object} msg - message
 * @param {object} msg.chat - chat
 * @param {Array<object>} msg.photo - photo
 * @param {string} msg.caption - caption
 * @returns {Promise<undefined>}
 */
const onPhoto = async ({ chat, photo, caption }) => {
  logger.log('info', onPhoto.name);
  const chatId = chat.id;
  const [_smallPhoto, mediumPhoto] = photo;
  if (!mediumPhoto.file_id || mediumPhoto.file_size === 0) {
    throw new Error('Wrong photo');
  }
  const fileBuffer = await getTelegramFile(mediumPhoto.file_id);
  try {
    const photoResult = await APIv2.insert(fileBuffer, { caption });
    await bot.sendMessage(chatId, photoResult, {
      parse_mode: 'Markdown',
    });
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, error.toString());
  }
};

module.exports = onPhoto;
