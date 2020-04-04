const destroyAction = require('../../../core/functions/destroy');
const TelegramBotRequest = require('./telegram-bot-request');

class DatabaseClear extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'dbclear';
  }
  async beginDialog(silent) {
    await super.beginDialog(silent);
    const { message_id } = await this.bot.sendMessage(
      this.message.chat.id,
      'Очистить ваши записи?\nНапишите: YES',
      {
        reply_markup: {
          force_reply: true,
        },
      },
    );
    // todo: проверять выгружен ли был бэкап, и если нет - предупреждать пользователя
    this.bot.onReplyToMessage(
      this.message.chat.id,
      message_id,
      async ({ text }) => {
        if (text !== 'YES') {
          await this.bot.sendMessage(this.message.chat.id, 'Операция отменена');
          return;
        }
        const jsonldAction = await destroyAction();
        await this.rpc(jsonldAction);
      },
    );
  }
}
/**
 * @description Очистить базу данных с подтверждением
 * @param {TelegramMessage} message - message
 * @param {boolean} silent - silent dialog
 * @returns {Promise<undefined>}
 */
module.exports = async (message, silent) => {
  const databaseClear = new DatabaseClear(message);
  await databaseClear.beginDialog(silent);
};
