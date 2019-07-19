const bot = require('../bot');
const sessions = require('../services/session.service');
const logger = require('../services/logger.service');
/**
 * Скачивание файла БД на устройство
 *
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
  const currentUser = sessions.getSession(fromId);
  const backupAPI = require('../api/v1/backup');
  try {
    const { filename, fileBuffer } = await backupAPI(currentUser, date);
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
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, 'Операция не выполнена');
  }
};

module.exports = onBackup;
