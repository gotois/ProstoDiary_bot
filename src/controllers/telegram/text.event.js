const package_ = require('../../../package');
const bot = require('../../core/bot');
const { pool } = require('../../core/database');
const passportQueries = require('../../db/passport');
const textService = require('../../services/text.service');
const TelegramBotRequest = require('./telegram-bot-request');

class Text extends TelegramBotRequest {
  onError(error) {
    throw error;
  }
  async beginDialog() {
    await super.beginDialog();
    const { message_id } = await bot.sendMessage(
      this.message.chat.id,
      `_${textService.previousInput(this.message.text)}_ 📝`,
      {
        parse_mode: 'Markdown',
        disable_notification: true,
        disable_web_page_preview: true,
      },
    );
    try {
      await bot.sendChatAction(this.message.chat.id, 'typing');
      const secretKey = await pool.connect(async (connection) => {
        const botTable = await connection.one(
          passportQueries.selectByPassport(this.message.passport.id),
        );
        return botTable.secret_key;
      });
      // Валидация и формирование зашифрованного сообщения
      const messageResult = await textService.prepareText({
        secretKey,
        text: this.message.text,
        caption: this.message.caption,
        passportId: this.message.passport.id,
      });
      // если сообщение успешно отвалидировано, то отправка зашифрованного сообщения на почту бота
      const postResult = await this.request('post', {
        ...messageResult,
        categories: ['transaction-write'].concat(this.hashtags),
        date: this.message.date,
        chat_id: this.message.chat.id,
        from: {
          email: package_.author.email,
          name: this.message.passport.id,
        },
        to: [
          {
            email: this.message.passport.botEmail,
            name: this.message.passport.botId,
          },
        ],
        telegram_message_id: message_id,
      });
      await bot.editMessageText(postResult, {
        chat_id: this.message.chat.id,
        message_id: message_id,
      });
    } catch (error) {
      await bot.editMessageText(error.message, {
        chat_id: this.message.chat.id,
        message_id: message_id,
      });
    }
  }
}
/**
 * @param {TelegramMessage} message - message
 * @returns {Promise<undefined>}
 */
module.exports = async (message) => {
  if (!message.passport.activated) {
    throw new Error('Bot not activated. Please try /start or /signin');
  }
  const text = new Text(message);
  await text.beginDialog();
};
