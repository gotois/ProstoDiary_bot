const { telegram, botCommands } = require('../commands');
const { IS_AVA } = require('../../../environment');
const logger = require('../../../lib/log');

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
    // hack для запуска e2e тестов
    if (IS_AVA) {
      message.passport = [
        {
          activated: true,
          user: 'ava-test',
          passportId: '-1',
          assistant: 'e2e@gotointeractive.com',
          email: 'e2e@gotointeractive.com',
          jwt: 'YOUR_VALID_JWT',
        },
      ];
    }
    if (!Array.isArray(message.passport)) {
      throw new TypeError('gotois passport error');
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
    logger.info('sendCommand');
    const { message } = this;
    if (this.inGroup && this.silent) {
      logger.info('sendCommand:skip');
      return;
    }
    checkMessage(message);
    await require('../controllers/' + event)(message, this.silent);
  }
  async sendText() {
    logger.info('sendText');
    const { message } = this;
    checkMessage(message);
    if (message.reply_to_message) {
      return;
    }
    await require('../controllers/text.event')(message, this.silent);
  }
  async sendPhoto() {
    logger.info('sendPhoto');
    const { message } = this;
    await require('../controllers/photo.event')(message, this.silent);
  }
  async sendDocument() {
    logger.info('sendDocument');
    const { message } = this;
    await require('../controllers/document.event')(message, this.silent);
  }
  async sendLocation() {
    logger.info('sendLocation');
    const { message } = this;
    await require('../controllers/location.event')(message, this.silent);
  }
  async sendVoice() {
    logger.info('sendVoice');
    const { message } = this;
    await require('../controllers/voice.event')(message, this.silent);
  }
  async groupChatCreated() {
    logger.info('groupChatCreated');
    await require('../controllers/group-chat-created.event')(this.message);
  }
  async newChatMembers() {
    logger.info('newChatMembers');
    await require('../controllers/new-chat-members.event')(this.message);
  }
  async migrateFromChat() {
    logger.info('migrateFromChat');
    await require('../controllers/migrate-from-chat.event')(this.message);
  }
  async leftChatMember() {
    logger.info('leftChatMember');
    await require('../controllers/left-chat-member.event')(this.message);
  }
}

module.exports = TelegramBotMessage;
