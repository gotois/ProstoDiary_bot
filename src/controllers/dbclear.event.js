const jsonrpc = require('jsonrpc-lite');
const bot = require('../core/bot');
const logger = require('../services/logger.service');
const APIv1DBClear = require('../api/v2/database-clear');
const TelegramBotRequest = require('./telegram-bot-request');

class DatabaseClear extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.api = APIv1DBClear;
  }
  async beginDialog() {
    logger.log('info', DatabaseClear.name);
    const options = {
      reply_markup: {
        force_reply: true,
      },
    };
    const { message_id } = await bot.sendMessage(
      this.message.chat.id,
      'Очистить ваши записи?\nНапишите: YES',
      options,
    );
    // todo: проверять выгружен ли был бэкап, и если нет - предупреждать пользователя
    bot.onReplyToMessage(this.message.chat.id, message_id, async ({ text }) => {
      if (text !== 'YES') {
        await bot.sendMessage(this.message.chat.id, 'Операция отменена');
        return;
      }
      const requestObject = jsonrpc.request('123', 'database clear', {
        userId: this.message.from.id,
      });
      const result = await this.request(requestObject);
      await bot.sendMessage(this.message.chat.id, result);
    });
  }
}
/**
 * @description Очистить базу данных с подтверждением
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
const onDatabaseClear = async (message) => {
  const databaseClear = new DatabaseClear(message);
  await databaseClear.beginDialog();
};

module.exports = onDatabaseClear;
