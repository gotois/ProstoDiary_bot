/**
 * @type {object}
 */
const telegram = {
  BACKUP: {
    // fixme похоже event не используется.
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
    alias: /^\/(search|найти)(\s)/,
    description: 'Поиск вхождения `String | RegExp`',
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

module.exports = {
  telegram,
};
