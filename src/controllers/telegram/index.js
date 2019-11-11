const bot = require('../../core/bot');
const logger = require('../../services/logger.service');
// const { IS_AVA_OR_CI } = require('../../environment');

/**
 * @type {object}
 */
const commands = {
  BACKUP: {
    event: './backup.event',
    alias: /^\/(backup|бэкап)$/,
    description: 'Выгрузка бэкапа',
  },
  DBCLEAR: {
    event: './dbclear.event',
    alias: /^\/dbclear$/,
    description: 'Очищение БД',
  },
  DOCUMENT: {
    event: './document.event',
    alias: 'document',
    description: '',
  },
  EDITED_MESSAGE_TEXT: {
    event: './edited-message-text.event',
    alias: 'edited_message_text',
    description: '',
  },
  HELP: {
    event: './help.event',
    alias: /^\/help|man|помощь$/,
    description: '',
  },
  LOCATION: {
    event: './location.event',
    alias: 'location',
    description: '',
  },
  PHOTO: {
    event: './photo.event',
    alias: 'photo',
    description: '',
  },
  PING: {
    event: './ping.event',
    alias: /^\/(ping|пинг)$/,
    description: 'Проверка сети',
  },
  SEARCH: {
    event: './search.event',
    alias: /^\/(search|найти)(\s)/,
    description: 'Поиск вхождения `String | RegExp`',
  },
  START: {
    event: './start.event',
    alias: /^\/start|начать$/,
    description: '',
  },
  TEXT: {
    event: './text.event',
    alias: /^\/$/,
    description: '',
  },
  VOICE: {
    event: './voice.event',
    alias: 'voice',
    description: '',
  },
};

bot.on('polling_error', (error) => {
  logger.log('error', error.toString());
});
bot.on('webhook_error', (error) => {
  logger.log('error', error.toString());
});
/**
 * @param {string} message - event name
 * @param {TelegramMessage} obj - matcher
 * @param {TelegramMessage} obj.type - matcher
 * @param {object} match - matcher
 */
bot.on('message', async (message, { type }) => {
  if (message.text.length === 1) {
    return;
  }
  if (message.reply_to_message instanceof Object) {
    if (!message.reply_to_message.from.is_bot) {
      throw new Error('Reply message not supported');
    }
  }
  const session = 'TEST_MESSAGE';
  console.log(session);

  switch (type) {
    case 'text': {
      const myCommands = Object.keys(commands).filter((key) => {
        return commands[key].alias instanceof RegExp;
      });
      // Пропускаем команды бота
      if (Array.isArray(message.entities)) {
        if (message.entities[0].type === 'bot_command') {
          // Пропускаем зарезервированные команды
          const commandReserved = myCommands.some((command) => {
            return message.text.search(commands[command].alias) >= 0;
          });
          if (!commandReserved) {
            throw new Error('Unknown command. Enter /help');
          }
        }
      }
      for (const key of myCommands) {
        if (commands[key].alias.test(message.text)) {
          require(commands[key].event)(message, session);
          return;
        }
      }
      require(commands.TEXT.event)(message, session);
      break;
    }
    case 'photo': {
      require(commands.PHOTO.event)(message, session);
      break;
    }
    case 'document': {
      require(commands.DOCUMENT.event)(message, session);
      break;
    }
    case 'location': {
      require(commands.LOCATION.event)(message, session);
      break;
    }
    case 'voice': {
      require(commands.VOICE.event)(message, session);
      break;
    }
    default: {
      throw new Error(`Unknown ${type}. Enter /help`);
    }
  }
});

module.exports = {
  commands,
};
