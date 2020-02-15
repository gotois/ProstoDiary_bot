const bot = require('../bot');
const signoutAction = require('../../../core/functions/signout');
const TelegramBotRequest = require('./telegram-bot-request');

class SignOut extends TelegramBotRequest {
  async beginDialog() {
    const result = await signoutAction({
      jwt: this.message.passport.jwt,
    });
    await bot.sendMessage(this.message.chat.id, result);
  }
}
/**
 * @param {TelegramMessage} message - msg
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  if (!message.passport.activated) {
    throw new Error('Bot not activated');
  }
  const signIn = new SignOut(message);
  await signIn.beginDialog();
};