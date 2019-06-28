const bot = require('../bot');
const dbEntries = require('../database/entities.database');
const { pack } = require('../services/archive.service');
const format = require('../services/format.service');
const sessions = require('../services/session.service');
const logger = require('../services/logger.service');
/**
 * @param {string} date - date
 * @returns {string}
 */
const generateName = (date) => {
  return `ProstoDiary_backup_${date}`;
};
/**
 * Скачивание файла БД на устройство
 *
 * @param {object} msg - message
 * @param {object} msg.chat - message chat
 * @param {object} msg.from - from
 * @param {string} msg.date - date
 * @returns {Promise<undefined>}
 */
const onDownload = async ({ chat, from, date }) => {
  logger.log('info', onDownload.name);
  const chatId = chat.id;
  const fromId = from.id;
  const fileName = generateName(date) + '.txt';
  const currentUser = sessions.getSession(fromId);
  try {
    const rows = await dbEntries.getAll(currentUser.id);
    if (rows.length === 0) {
      await bot.sendMessage(chatId, 'Нет данных');
      return;
    }
    const formatData = format.formatRows(rows);
    const buffers = await pack(formatData, fileName);
    await bot.sendDocument(
      chatId,
      buffers,
      {
        caption: fileName,
      },
      {
        filename: generateName(date) + '.zip',
        contentType: 'application/zip',
      },
    );
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, 'Операция не выполнена');
  }
};

module.exports = onDownload;
