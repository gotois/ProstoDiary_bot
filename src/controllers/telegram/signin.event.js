const bot = require('../../core/bot');
const TelegramBotRequest = require('./telegram-bot-request');
const { SERVER } = require('../../environment');

class SignIn extends TelegramBotRequest {
  async beginDialog() {
    await bot.sendMessage(
      this.message.chat.id,
      'Выберите способ авторизации:',
      {
        parse_mode: 'HTML',
        reply_markup: {
          force_reply: true,
          inline_keyboard: [
            [
              {
                text: 'Yandex',
                url: `${SERVER.HOST}/connect/yandex`,
              },
              {
                text: 'Facebook',
                url: `${SERVER.HOST}/connect/facebook`,
              },
            ],
          ],
        },
      },
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
