const bot = require('../../core/bot');
const signinMessage = require('../../core/functions/signin');
const TelegramBotRequest = require('./telegram-bot-request');

class SignIn extends TelegramBotRequest {
  /**
   * @todo происходит дублирование при запросе /signin
   * @param {object} object - object
   * @param {string} object.text - token
   * @returns {Promise<undefined>}
   */
  async signInReplyMessage({ text }) {
    try {
      const signinAction = signinMessage({ token: text });
      await this.request('signin', signinAction);
    } catch (error) {
      await bot.sendMessage(this.message.chat.id, error.purpose.text);
      return;
    }
    const me = await bot.getMe();
    await bot.sendMessage(
      this.message.chat.id,
      `Приветствую ${this.message.chat.first_name}!\n` +
        `Я твой персональный бот __${me.first_name}__.\n` +
        'Узнай все мои возможности командой /help.',
      {
        parse_mode: 'Markdown',
      },
    );
  }
  async beginDialog() {
    if (this.message.reply_to_message) {
      await this.signInReplyMessage({ text: this.message.text });
      return;
    }
    const checkSecretValue = await bot.sendMessage(
      this.message.chat.id,
      'Ваш токен двухфакторной авторизации:',
      {
        reply_markup: {
          force_reply: true,
        },
      },
    );
    bot.onReplyToMessage(
      this.message.chat.id,
      checkSecretValue.message_id,
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
module.exports.SignIn = SignIn;
