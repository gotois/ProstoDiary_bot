const bot = require('../../core/bot');
const jsonrpc = require('../../core/jsonrpc');
const { pool } = require('../../core/database');
const TelegramBotRequest = require('./telegram-bot-request');
const passportQueries = require('../../db/passport');

class SignIn extends TelegramBotRequest {
  /**
   * @todo происходит дублирование при запросе /signin
   * @param {object} object - object
   * @param {string} object.text - token
   * @returns {Promise<undefined>}
   */
  async signInReplyMessage({ text }) {
    const passportTable = await pool.connect(async (connection) => {
      const passportTable = await connection.one(
        passportQueries.selectAll(this.message.from.id),
      );
      return passportTable;
    });
    try {
      await jsonrpc.rpcRequest(
        'signin',
        {
          token: text,
          telegram_chat_id: this.message.chat.id,
        },
        {
          ...passportTable,
        },
      );
    } catch (error) {
      await bot.sendMessage(this.message.chat.id, error.message);
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
