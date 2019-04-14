const bot = require('../bot');
const { get } = require('./request.service');
/**
 * @param {string} fileId - file id
 * @returns {Promise<string|Buffer|Error|*>}
 */
const getTelegramFile = async (fileId) => {
  const fileInfo = await bot.getFile(fileId);
  const buffer = await get(
    `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`,
  );
  return buffer;
};

module.exports = {
  getTelegramFile,
};
