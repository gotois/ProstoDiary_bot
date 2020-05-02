/**
 * @see https://github.com/gotois/ProstoDiary_bot/issues/571
 * @type {object}
 */
const allCommands = {
  BACKUP: {
    event: 'backup.event',
    alias: /^\/(backup|бэкап)$/,
    description: 'Выгрузка бэкапа',
  },
  DBCLEAR: {
    event: 'dbclear.event',
    alias: /^\/dbclear$/,
    description: 'Очищение БД',
  },
  DOCUMENT: {
    event: 'document.event',
    alias: 'document',
    description: '',
  },
  EDITED_MESSAGE_TEXT: {
    event: 'edited-message-text.event',
    alias: 'edited_message_text',
    description: '',
  },
  HELP: {
    event: 'help.event',
    alias: /^\/help|man|помощь$/,
    description: 'Помощь',
  },
  LOCATION: {
    event: 'location.event',
    alias: 'location',
    description: '',
  },
  PHOTO: {
    event: 'photo.event',
    alias: 'photo',
    description: '',
  },
  PING: {
    event: 'ping.event',
    alias: /^\/(ping|пинг)$/,
    description: 'Проверка сети',
  },
  SEARCH: {
    event: 'search.event',
    alias: /^бот|bot(\s)|\?$/,
    description: 'Бот список вхождения?',
  },
  START: {
    event: 'start.event',
    alias: /^\/start|начать$/,
    description: 'Start',
  },
  TEXT: {
    event: 'text.event',
    // todo. правильным будет сделать если на конце будет точка, тогда записывать предложение боту
    //  todo если будет восклицательный знак, значит это поручение выполнить боту
    alias: /^\/$/,
    description: '',
  },
  VOICE: {
    event: 'voice.event',
    alias: 'voice',
    description: '',
  },
};

module.exports = {
  // todo переименовать в "all"
  get telegram() {
    return allCommands;
  },
  // todo переименовать в "systemCommands"
  get botCommands() {
    const allCommands = this.telegram;
    return Object.keys(allCommands).filter((key) => {
      return allCommands[key].alias instanceof RegExp;
    });
  },
  // todo добавить "nativeCommands", где все комманды созданные telegram'ом вида: document, photo, text
};
