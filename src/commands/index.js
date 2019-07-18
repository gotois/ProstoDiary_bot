/**
 * @todo переместить в controllers
 * @type {object}
 */
module.exports = {
  PING: {
    alias: /^\/(ping|пинг)$/,
    description: '',
  },
  BACKUP: {
    alias: /^\/(backup|бэкап)$/,
    description: 'Загрузка файла с данными',
  },
  DB_CLEAR: {
    alias: /^\/dbclear$/,
    description: 'Удаление БД `/dbclear YES`',
  },
  START: {
    alias: /^\/start|начать$/,
    description: '',
  },
  HELP: {
    alias: /^\/help|помощь$/,
    description: '',
  },
  VERSION: {
    alias: /^\/version|версия$/,
    description:
      'Получение версии `/version` (для взаимодействия ботов нужна одинаковая версия)',
  },
  // TODO: расширить до 'get yesterday'/ 'get позавчера' и т.д. -> https://github.com/gotois/ProstoDiary_bot/issues/54
  GET_TODAY: {
    alias: /^\/get today$/,
    description: '',
  },
  GET_DATE: {
    alias: /^\/get (\d{4}-\d{1,2}-\d{1,2})$/,
    description: 'Получение данных за этот срок `/get YYYY-MM-DD`',
  },
  SET_DATE: {
    alias: /^\/set (\d{4}-\d{1,2}-\d{1,2})\s/,
    description: 'Добавление данных за этот срок `/set YYYY-MM-DD something`',
  },
  GRAPH: {
    alias: /^\/graph(\s)/,
    description: 'Построение графиков `/graph String|RegExp`',
  },
  BALANCE: {
    alias: /^\/balance$/,
    description: 'Отображение всех денежных средств пользователя',
  },
  COUNT: {
    alias: /^\/count$|\/count\s(.+)/,
    description: 'Подсчет потраченого `/count -` и полученного `/count +`',
  },
  SEARCH: {
    alias: /^\/(search|найти)(\s)(.+)/,
    description: 'Поиск вхождения `/search something`',
  },
  KPP: {
    alias: /^\/kpp(\s)(.+)/,
    description: 'Просмотр информации по своему чеку',
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
