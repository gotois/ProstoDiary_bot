const bot = require('../../core/bot');
const TelegramBotRequest = require('./telegram-bot-request');

class EditMessageText extends TelegramBotRequest {
  /**
   * @constant
   * @type {string[]}
   */
  static get DELETE_VARIABLES() {
    return ['del', 'remove'];
  }
  async beginDialog() {
    await super.beginDialog();
    if (this.message.text.startsWith('/')) {
      await bot.sendMessage(
        this.message.chat.id,
        'Редактирование этой записи невозможно',
      );
      return;
    }
    // fixme
    // if (!isExist) {
    // TODO: если записи нет - тогда спрашиваем пользователя, создавать ли новую запись?
    // await bot.sendMessage(this.message.chat.id, 'Запись не найдена');
    // return;
    // }
    // Сообщение удалено?
    if (
      EditMessageText.DELETE_VARIABLES.some((del) => {
        return this.message.text.toLowerCase() === del.toLowerCase();
      })
    ) {
      const result = await this.request('remove');
      await bot.sendMessage(this.message.chat.id, result, {
        parse_mode: 'Markdown',
      });
    } else {
      // TODO: https://github.com/gotois/ProstoDiary_bot/issues/34
      const result = await this.request('edit');
      await bot.sendMessage(this.message.chat.id, result, {
        parse_mode: 'Markdown',
      });
    }
  }
}
/**
 * @description Обновление текста в БД
 * @param {TelegramMessage} message - msg
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  if (!message.passport.activated) {
    throw new Error('Bot not activated');
  }
  message.text = message.text.trim();
  const editedMessageTextAPI = new EditMessageText(message);
  await editedMessageTextAPI.beginDialog();
};
