const bot = require('../core');
const logger = require('../services/logger.service');
const backupAPI = require('../api/v1/backup');
/**
 * @description Скачивание файла БД на устройство
 * @param {object} msg - message
 * @param {object} msg.chat - message chat
 * @param {object} msg.from - from
 * @param {string} msg.date - date
 * @returns {Promise<undefined>}
 */
const onBackup = async ({ chat, from, date }) => {
  logger.log('info', onBackup.name);
  const chatId = chat.id;
  const fromId = from.id;

  // todo: https://github.com/gotois/ProstoDiary_bot/issues/162

  const { error, result } = await backupAPI(fromId, date);
  if (error) {
    logger.log('error', error.message.toString());
    await bot.sendMessage(chatId, error.message);
    return;
  }
  const { filename, fileBuffer } = result;
  await bot.sendDocument(
    chatId,
    fileBuffer,
    {
      caption: filename,
    },
    {
      filename: filename + '.zip',
      contentType: 'application/zip',
    },
  );
};

module.exports = onBackup;
