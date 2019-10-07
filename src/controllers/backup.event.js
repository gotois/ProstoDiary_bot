const jsonrpc = require('jsonrpc-lite');
const bot = require('../core/bot');
const logger = require('../services/logger.service');
const backupAPI = require('../api/v2/backup');
const TelegramBotRequest = require('./telegram-bot-request');

class Backup extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.api = backupAPI;
  }
  async beginDialog() {
    logger.log('info', Backup.name);
    const requestObject = jsonrpc.request('123', 'backup', {
      userId: this.message.from.id,
      date: this.message.date,
    });
    const { filename, fileBuffer } = await this.request(requestObject);
    await bot.sendDocument(
      this.message.chat.id,
      fileBuffer,
      {
        caption: filename,
      },
      {
        filename: filename + '.zip',
        contentType: 'application/zip',
      },
    );
  }
}
/**
 * @description Скачивание файла БД на устройство
 * @todo https://github.com/gotois/ProstoDiary_bot/issues/162
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
const onBackup = async (message) => {
  const backup = new Backup(message);
  await backup.beginDialog();
};

module.exports = onBackup;
