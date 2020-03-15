/**
 * @todo переименовать в "все команды"
 * @type {object}
 */
const telegram = {
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
  SIGNIN: {
    event: 'signin.event',
    alias: /^\/signin$/,
    description: 'Войти в систему',
  },
  SIGNOUT: {
    event: 'signout.event',
    alias: /^\/signout$/,
    description: 'Выйти из системы',
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
// todo переименовать в "системные команды"
const botCommands = Object.keys(telegram).filter((key) => {
  return telegram[key].alias instanceof RegExp;
});

module.exports = {
  // todo перенести команды в геттеры
  telegram,
  botCommands,
};
