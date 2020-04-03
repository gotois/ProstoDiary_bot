const signinAction = require('../../../core/functions/signin');
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
      await signinAction({
        token: text,
        jwt: this.message.passport.jwt,
      });
    } catch (error) {
      await this.bot.sendMessage(this.message.chat.id, error.purpose.text);
      return;
    }
  }
  async beginDialog() {
    if (this.message.reply_to_message) {
      await this.signInReplyMessage({ text: this.message.text });
      return;
    }
    const checkSecretValue = await this.bot.sendMessage(
      this.message.chat.id,
      'Ваш токен двухфакторной авторизации:',
      {
        reply_markup: {
          force_reply: true,
        },
      },
    );
    this.bot.onReplyToMessage(
      this.message.chat.id,
      checkSecretValue.message_id,
      this.signInReplyMessage.bind(this),
    );
  }
}
/**
 * @param {TelegramMessage} message - msg
 * @param {boolean} silent - silent dialog
 * @returns {Promise<undefined>}
 */
module.exports = async (message, silent) => {
  const signIn = new SignIn(message);
  await signIn.beginDialog(silent);
};
module.exports.SignIn = SignIn;
