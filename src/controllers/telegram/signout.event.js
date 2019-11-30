const bot = require('../../core/bot');
const TelegramBotRequest = require('./telegram-bot-request');

class SignOut extends TelegramBotRequest {
  async beginDialog() {
    const result = await this.request('signout', {
      passportId: this.message.gotois.id,
    });
    await bot.sendMessage(this.message.chat.id, result);
  }
}
/**
 * @param {TelegramMessage} message - msg
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  if (!message.gotois.activated) {
    throw new Error('Bot not activated');
  }
  const signIn = new SignOut(message);
  await signIn.beginDialog();
};
