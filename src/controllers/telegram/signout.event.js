const bot = require('../../core/bot');
const signoutMessage = require('../../core/functions/signout');
const TelegramBotRequest = require('./telegram-bot-request');

class SignOut extends TelegramBotRequest {
  async beginDialog() {
    const signoutAction = signoutMessage();
    const result = await this.request('post', signoutAction);
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
