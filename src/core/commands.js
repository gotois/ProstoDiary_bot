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
  // TODO: расширить до 'get yesterday'/ 'get позавчера' и т.д. -> https://github.com/gotois/ProstoDiary_bot/issues/54
  GETTODAY: {
    alias: /^\/get today$/,
    description: '',
  },
  GET: {
    alias: /^\/get (\d{4}-\d{1,2}-\d{1,2})$/,
    description: 'Получение данных за этот срок `YYYY-MM-DD`',
  },
  SET: {
    alias: /^\/set (\d{4}-\d{1,2}-\d{1,2})\s/,
    description: 'Добавление данных за этот срок `YYYY-MM-DD`',
  },
  GRAPH: {
    alias: /^\/graph(\s)/,
    description: 'Построение графиков `String | RegExp`',
  },
  BALANCE: {
    alias: /^\/balance$/,
    description: 'Отображение всех денежных средств пользователя',
  },
  COUNT: {
    alias: /^\/count$|\/count\s(.+)/,
    description: 'Подсчет потраченого `- | +`',
  },
  SEARCH: {
    alias: /^\/(search|найти)(\s)(.+)/,
    description: 'Поиск вхождения `String`',
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
