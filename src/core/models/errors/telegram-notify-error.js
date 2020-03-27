class TelegramNotifyError extends Error {
  constructor(message, telegramMessageId, chatId) {
    super(message);
    this.name = 'TelegramNotifyError';
    this.chatId = chatId;
    this.messageId = telegramMessageId;
  }
}

module.exports = TelegramNotifyError;
