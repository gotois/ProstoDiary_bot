const bot = require('../include/telegram-bot/bot');
const { get } = require('./request.service');
/**
 * @type {string}
 */
const TELEGRAM_HOST = 'api.telegram.org';
/**
 * @param {string} fileId - file id
 * @returns {Promise<Buffer>}
 */
const getTelegramFile = async (fileId) => {
  const fileInfo = await bot.getFile(fileId);
  const buffer = await get(
    `https://${TELEGRAM_HOST}/file/bot${bot.token}/${fileInfo.file_path}`,
  );
  return buffer;
};

module.exports = {
  getTelegramFile,
};
