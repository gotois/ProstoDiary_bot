const bot = require('../core');
const logger = require('../services/logger.service');
const { getTelegramFile } = require('../services/telegram-file.service');
const APIv2 = require('../api/v2');
/**
 * @param {object} message - message
 * @param {object} message.chat - chat
 * @param {Array<object>} message.photo - photo
 * @param {string} message.caption - caption
 * @returns {Promise<undefined>}
 */
const onPhoto = async ({ chat, photo, caption, from, date, message_id }) => {
  logger.log('info', onPhoto.name);
  const chatId = chat.id;
  const [_smallPhoto, mediumPhoto] = photo;
  if (!mediumPhoto.file_id || mediumPhoto.file_size === 0) {
    throw new Error('Wrong photo');
  }
  const fileBuffer = await getTelegramFile(mediumPhoto.file_id);
  const { error, result } = await APIv2.insert(fileBuffer, {
    caption,
    date,
    telegram_user_id: from.id,
    telegram_message_id: message_id,
  });
  if (error) {
    logger.log('error', error);
    await bot.sendMessage(chatId, error);
    return;
  }
  await bot.sendMessage(chatId, result, {
    parse_mode: 'Markdown',
  });
};

module.exports = onPhoto;
