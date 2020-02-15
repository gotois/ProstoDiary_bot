const bot = require('../bot');
const destroyAction = require('../../../core/functions/destroy');
const TelegramBotRequest = require('./telegram-bot-request');

class DatabaseClear extends TelegramBotRequest {
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
      const result = await destroyAction({
        jwt: this.message.passport.jwt,
      });
      await bot.sendMessage(this.message.chat.id, result);
    });
  }
}
/**
 * @description Очистить базу данных с подтверждением
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  if (!message.passport.activated) {
    throw new Error('Bot not activated');
  }
  const databaseClear = new DatabaseClear(message);
  await databaseClear.beginDialog();
};