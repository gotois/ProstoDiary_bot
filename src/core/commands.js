/**
 * @type {object}
 */
module.exports = {
  PING: {
    alias: /^\/(ping|пинг)$/,
    description: '',
  },
  BACKUP: {
    alias: /^\/(backup|бэкап)$/,
    description: 'Выгрузка бэкапа',
  },
  DBCLEAR: {
    alias: /^\/dbclear$/,
    description: 'Очищение БД',
  },
  START: {
    alias: /^\/start|начать$/,
    description: '',
  },
  HELP: {
    alias: /^\/help|man|помощь$/,
    description: '',
  },
  VERSION: {
    alias: /^\/version|версия$/,
    description:
      'Получение версии (для взаимодействия ботов нужна одинаковая версия)',
  },
  SET: {
    alias: /^\/set (\d{4}-\d{1,2}-\d{1,2})\s/,
    description: 'Добавление данных за этот срок `YYYY-MM-DD`',
  },
  BALANCE: {
    alias: /^\/balance$/,
    description: 'Отображение всех денежных средств пользователя',
  },
  SEARCH: {
    alias: /^\/(search|найти)(\s)/,
    description: 'Поиск вхождения `String | RegExp`',
  },
  EDITED_MESSAGE_TEXT: {
    alias: 'edited_message_text',
    description: '',
  },
  TEXT: {
    alias: 'text',
    description: '',
  },
  WEBHOOK_ERROR: {
    alias: 'webhook_error',
    description: '',
  },
  PHOTO: {
    alias: 'photo',
    description: '',
  },
  LOCATION: {
    alias: 'location',
    description: '',
  },
  VOICE: {
    alias: 'voice',
    description: '',
  },
  DOCUMENT: {
    alias: 'document',
    description: '',
  },
};
