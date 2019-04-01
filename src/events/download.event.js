const zip = require('node-native-zip');
const format = require('../services/format.service');
const dbEntries = require('../database');
const sessions = require('../services/session.service');
const bot = require('../bot');
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
 * @param {Object} msg - message
 * @param {Object} msg.chat - message chat
 * @param {Object} msg.from - from
 * @param {string} msg.date - date
 * @returns {Promise<undefined>}
 */
const onDownload = async ({ chat, from, date }) => {
  logger.log('info', onDownload.name);
  const chatId = chat.id;
  const fromId = from.id;
  const fileName = generateName(date) + '.txt';
  const archive = new zip();
  const currentUser = sessions.getSession(fromId);
  try {
    const { rows } = await dbEntries.getAll(currentUser.id);
    if (rows.length > 0) {
      const formatData = format.formatRows(rows);
      archive.add(fileName, new Buffer(formatData, 'utf8'));
      const buffer = archive.toBuffer();
      await bot.sendDocument(
        chatId,
        buffer,
        {
          caption: fileName,
        },
        {
          filename: generateName(date) + '.zip',
          contentType: 'application/zip',
        },
      );
    } else {
      await bot.sendMessage(chatId, 'Нет данных');
    }
  } catch (error) {
    logger.log('error', error.toString());
    await bot.sendMessage(chatId, 'Операция не выполнена');
  }
};

module.exports = onDownload;
