const { telegram, botCommands } = require('../commands');

const checkMessage = (message) => {
  // Пропускаем команды бота
  if (Array.isArray(message.entities)) {
    if (message.entities[0].type === 'bot_command') {
      // Пропускаем зарезервированные команды
      const commandReserved = botCommands.some((command) => {
        return message.text.search(telegram[command].alias) >= 0;
      });
      if (!commandReserved) {
        throw new Error('Unknown command. Enter /help');
      }
    }
  }
};

const checkMentionMessage = (message) => {
  if (Array.isArray(message.entities)) {
    return message.entities.some((entity) => {
      return entity.type === 'mention';
    });
  }
  return false;
};

class TelegramBotMessage {
  /**
   * @param {TelegramMessage} message - message
   * @returns {undefined}
   */
  constructor(message) {
    if (!message.passport) {
      throw new Error('gotois message error');
    }
    // Нативное сообщение Telegram
    this.message = message;
    // тихий режим, когда результат не отображается пользователю
    this.silent = false;

    if (message.chat && message.chat.type === 'supergroup') {
      this.inGroup = true;
      if (!checkMentionMessage(message)) {
        this.silent = true;
      }
    }
    if (message.reply_to_message instanceof Object) {
      if (!message.reply_to_message.from.is_bot) {
        throw new Error('Reply message not supported');
      }
    }
  }
  async sendCommand(event) {
    const { message } = this;
    if (this.inGroup && this.silent) {
      return;
    }
    checkMessage(message);
    await require('../controllers/' + event)(message, this.silent);
  }
  async sendText() {
    const { message } = this;
    checkMessage(message);
    if (message.reply_to_message) {
      if (message.passport.activated) {
        return;
      }
      // если бот не активирован, то проверяем что он прислал код авторизации
      await require('./controllers/signin.event')(message);
      return;
    }
    if (!message.passport.activated) {
      throw new Error('Bot not activated. Please try /start or /signin');
    }
    await require('../controllers/text.event')(message, this.silent);
  }
  async sendPhoto() {
    const { message } = this;
    if (!message.passport.activated) {
      throw new Error('Bot not activated');
    }
    await require('../controllers/photo.event')(message, this.silent);
  }
  async sendDocument() {
    const { message } = this;
    if (!message.passport.activated) {
      throw new Error('Bot not activated');
    }
    await require('../controllers/document.event')(message, this.silent);
  }
  async sendLocation() {
    const { message } = this;
    if (!message.passport.activated) {
      throw new Error('Bot not activated');
    }
    await require('../controllers/location.event')(message, this.silent);
  }
  async sendVoice() {
    const { message } = this;
    if (!message.passport.activated) {
      throw new Error('Bot not activated');
    }
    await require('../controllers/voice.event')(message, this.silent);
  }
  async groupChatCreated() {
    await require('../controllers/group-chat-created.event')(this.message);
  }
  async newChatMembers() {
    await require('../controllers/new-chat-members.event')(this.message);
  }
  migrateFromChat() {
    // todo
  }
}

module.exports = TelegramBotMessage;
