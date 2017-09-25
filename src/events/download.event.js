const zip = require('node-native-zip');
const format = require('../services/format.service');
const dbEntries = require('../database/bot.database');
const sessions = require('../services/session.service');
const bot = require('./../config/bot.config');
/***
 * Скачивание файла БД на устройство
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.from {Object}
 * @param msg.date {String}
 * @return {void}
 */
const onDownload = async ({chat, from, date}) => {
  const chatId = chat.id;
  const fromId = from.id;
  const fileName = `prosto-diary-backup-${date}.txt`;
  const archive = new zip();
  const currentUser = sessions.getSession(fromId);
  dbEntries.getAll(currentUser.id).then(({rows}) => {
    if (rows.length > 0) {
      const formatData = format.formatRows(rows);
      archive.add(fileName, new Buffer(formatData, 'utf8'));
      const buffer = archive.toBuffer();
      return bot.sendDocument(chatId, buffer);
    } else {
      return bot.sendMessage(chatId, 'Нет данных');
    }
  }).catch(error => {
    console.error(error);
    return bot.sendMessage(chatId, 'Операция не выполнена');
  });
};

module.exports = onDownload;
