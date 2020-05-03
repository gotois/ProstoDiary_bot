/**
 * @type {object}
 */
const nativeCommands = {
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
  VOICE: {
    event: 'voice.event',
    alias: 'voice',
    description: '',
  },
};
/**
 * @type {object}
 */
const apiCommands = {
  BACKUP: {
    event: 'backup.event',
    alias: /^\/(backup|бэкап)$/,
    description: 'Выгрузка бэкапа',
  },
  HELP: {
    event: 'help.event',
    alias: /^\/help|man|помощь$/,
    description: 'Помощь',
  },
  PING: {
    event: 'ping.event',
    alias: /^\/(ping|пинг)$/,
    description: 'Проверка сети',
  },
};
/**
 * @type {object}
 */
const allCommands = {
  ...nativeCommands,
  ...apiCommands,

  DBCLEAR: {
    event: 'dbclear.event',
    alias: /^\/dbclear$/,
    description: 'Очищение БД',
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
};

module.exports = {
  get allCommands() {
    return allCommands;
  },
  get systemCommands() {
    const { allCommands } = this;
    return Object.keys(allCommands).filter((key) => {
      return allCommands[key].alias instanceof RegExp;
    });
  },
  get apiCommands() {
    return apiCommands;
  },
  get nativeCommands() {
    return nativeCommands;
  },
};
