const { allCommands, systemCommands } = require('../commands');
const { IS_AVA } = require('../../../environment');
const logger = require('../../../lib/log');
const { FakerPassport } = require('../../../services/faker.service');

const checkMessage = (message) => {
  // Пропускаем команды бота
  if (Array.isArray(message.entities)) {
    if (message.entities[0].type === 'bot_command') {
      // Пропускаем зарезервированные команды
      const commandReserved = systemCommands.some((command) => {
        return message.text.search(allCommands[command].alias) >= 0;
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
   * @param {object} metadata - metadata
   * @returns {undefined}
   */
  constructor(message, metadata = {}) {
    // hack для запуска e2e тестов
    if (IS_AVA) {
      message.passports = [FakerPassport.passport];
    }
    if (!Array.isArray(message.passports)) {
      throw new TypeError('gotois passport error');
    }
    // Нативное сообщение Telegram
    this.message = message;
    // Метаданные сообщения Telegram
    this.metadata = metadata;
    // тихий режим, когда результат не отображается пользователю
    this.silent = false;

    if (message.chat && message.chat.type === 'supergroup') {
      this.inGroup = true;
      if (!checkMentionMessage(message)) {
        this.silent = true;
      }
    }
    // todo перенести в web/telegram.js
    if (message.reply_to_message instanceof Object) {
      if (!message.reply_to_message.from.is_bot) {
        throw new Error('Reply message not supported');
      }
    }
    switch (metadata.type) {
      // расширяем собственными типами запросов
      case 'text': {
        if (message.type === 'edited_message') {
          this.type = 'edit-text';
          checkMessage(message);
          return;
        }
        // case 1: system command
        for (const key of systemCommands) {
          if (allCommands[key].alias.test(message.text)) {
            this.type = 'system-diary';
            checkMessage(message);
            // hack - можно сделать лучше, в конструкторе инициализируя require нужного ивента
            this.requestEvent = allCommands[key].event;
            return;
          }
        }
        // case 2: executive command
        if (message.text.startsWith('! ')) {
          this.type = 'executive-diary';
          // todo надо очищать "!" из запроса
          return;
        }
        // case 3: searching
        if (message.text.startsWith('? ')) {
          this.type = 'searching-diary';
          // todo надо очищать "?" из запроса
          return;
        }
        // case 4: writing
        if (message.text.startsWith('. ')) {
          // todo надо очищать "." из запроса
          this.type = 'text';
          return;
        }
        checkMessage(message);
        this.type = metadata.type;
        break;
      }
      default: {
        this.type = metadata.type;
        break;
      }
    }
  }
  async sendCommand(event) {
    logger.info('sendCommand');
    const { message } = this;
    // todo перенести эту логику в web/telegram.js
    if (this.inGroup && this.silent) {
      logger.info('sendCommand:skip');
      return;
    }
    await require('../controllers/' + event)(message, this.silent);
  }
  // todo Выполнение поручения заданное пользователем
  // eslint-disable-next-line
  async sendExecuteText() {
    logger.info('sendExecuteText');
  }
  // todo Выполнение поиска в истории
  // eslint-disable-next-line
  async sendSearchText() {
    logger.info('sendSearchText');
  }
  async editText() {
    logger.info('editText');
    await require('../controllers/edited-message-text.event')(
      this.message,
      this.silent,
    );
  }
  async sendText() {
    logger.info('sendText');
    const { message } = this;
    // todo перенести эту логику в web/telegram.js
    if (message.reply_to_message) {
      return;
    }
    await require('../controllers/text.event')(this.message, this.silent);
  }
  async sendPhoto() {
    logger.info('sendPhoto');
    await require('../controllers/photo.event')(this.message, this.silent);
  }
  async sendDocument() {
    logger.info('sendDocument');
    await require('../controllers/document.event')(this.message, this.silent);
  }
  async sendLocation() {
    logger.info('sendLocation');
    await require('../controllers/location.event')(this.message, this.silent);
  }
  async sendVoice() {
    logger.info('sendVoice');
    await require('../controllers/voice.event')(this.message, this.silent);
  }
  async groupChatCreated() {
    logger.info('group chat created');
    await require('../controllers/group-chat-created.event')(this.message);
  }
  async newChatMembers() {
    logger.info('new chat members');
    await require('../controllers/new-chat-members.event')(this.message);
  }
  async migrateFromChat() {
    logger.info('migrate from chat');
    await require('../controllers/migrate-from-chat.event')(this.message);
  }
  async leftChatMember() {
    logger.info('left chat member');
    await require('../controllers/left-chat-member.event')(this.message);
  }
}

module.exports = TelegramBotMessage;
