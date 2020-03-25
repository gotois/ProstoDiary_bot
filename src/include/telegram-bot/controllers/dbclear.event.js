const bot = require('../bot');
const destroyAction = require('../../../core/functions/destroy');
const TelegramBotRequest = require('./telegram-bot-request');

class DatabaseClear extends TelegramBotRequest {
  constructor(message) {
    super(message);
    this.method = 'signout';
  }
  async beginDialog() {
    await super.beginDialog();
    const { message_id } = await bot.sendMessage(
      this.message.chat.id,
      'Очистить ваши записи?\nНапишите: YES',
      {
        reply_markup: {
          force_reply: true,
        },
      },
    );
    // todo: проверять выгружен ли был бэкап, и если нет - предупреждать пользователя
    bot.onReplyToMessage(this.message.chat.id, message_id, async ({ text }) => {
      if (text !== 'YES') {
        await bot.sendMessage(this.message.chat.id, 'Операция отменена');
        return;
      }
      const jsonldAction = await destroyAction();
      const jsonldMessage = await this.rpc(jsonldAction);
      await bot.sendMessage(this.message.chat.id, jsonldMessage.purpose.abstract);
    });
  }
}
/**
 * @description Очистить базу данных с подтверждением
 * @param {TelegramMessage} message - message
 * @param {boolean} silent - silent dialog
 * @returns {Promise<undefined>}
 */
module.exports = async (message, silent) => {
  if (!message.passport.activated) {
    throw new Error('Bot not activated');
  }
  const databaseClear = new DatabaseClear(message);
  await databaseClear.beginDialog(silent);
};
