/**
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
  PING: {
    event: 'ping.event',
    alias: /^\/(ping|пинг)$/,
    description: 'Проверка сети',
  },
  SEARCH: {
    event: 'search.event',
    // todo добавить еще сценарий когда пользователь вводить вопрос в конце предложения `?`
    alias: /^бот|bot(\s)/,
    description: 'Бот список вхождения `String | RegExp`',
  },
  SIGNIN: {
    event: 'signin.event',
    alias: /^\/signin$/,
    description: '',
  },
  SIGNOUT: {
    event: 'signout.event',
    alias: /^\/signout$/,
    description: '',
  },
  START: {
    event: 'start.event',
    alias: /^\/start|начать$/,
    description: '',
  },
  TEXT: {
    event: 'text.event',
    alias: /^\/$/,
    description: '',
  },
  VOICE: {
    event: 'voice.event',
    alias: 'voice',
    description: '',
  },
};

const botCommands = Object.keys(telegram).filter((key) => {
  return telegram[key].alias instanceof RegExp;
});

module.exports = {
  telegram,
  botCommands,
};
