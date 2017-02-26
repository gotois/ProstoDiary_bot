const zip = require('node-native-zip');
const format = require('./../format');
const dbEntries = require('./../database/database.entries.js');
const sessions = require('./../sessions');
const bot = require('./../bot.config.js');
/***
 * Скачивание файла БД на устройство
 * @param msg {Object}
 * @return {void}
 */
function onDownload(msg) {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;
  const fileName = `prosto-diary-backup-${msg.date}.txt`;
  const archive = new zip();
  const currentUser = sessions.getSession(fromId);
  dbEntries.getAll(currentUser.id).then(data => {
    if (data.rows.length > 0) {
      const formatData = format.formatRows(data.rows);
      archive.add(fileName, new Buffer(formatData, 'utf8'));
      const buffer = archive.toBuffer();
      bot.sendDocument(chatId, buffer);
    } else {
      bot.sendMessage(chatId, 'Нет данных');
    }
  }).catch(error => {
    console.error(error);
    bot.sendMessage(chatId, 'Операция не выполнена');
  });
}

module.exports = onDownload;
