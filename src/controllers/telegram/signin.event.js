const bot = require('../../core/bot');
const TelegramBotRequest = require('./telegram-bot-request');

class SignIn extends TelegramBotRequest {
  async signInReplyMessage({ text }) {
    const result = await this.request('signin', {
      passportId: this.message.gotois.id,
      token: text,
    });
    await bot.sendMessage(this.message.chat.id, result);
  }
  async beginDialog() {
    const signInMessage = await bot.sendMessage(
      this.message.chat.id,
      'Пришлите токен двухфакторной авторизации:',
      {
        reply_markup: {
          force_reply: true,
        },
      },
    );
    bot.onReplyToMessage(
      this.message.chat.id,
      signInMessage.message_id,
      this.signInReplyMessage.bind(this),
    );
  }
}
/**
 * @param {TelegramMessage} message - msg
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  const signIn = new SignIn(message);
  await signIn.beginDialog();
};
