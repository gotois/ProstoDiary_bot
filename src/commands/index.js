/**
 * @todo переместить в controllers
 * @type {object}
 */
module.exports = {
  PING: /^\/ping$/,
  DOWNLOAD: /^\/download$/,
  DB_CLEAR: /^\/dbclear$/,
  START: /^\/start$/,
  HELP: /^\/help$/,
  VERSION: /^\/version$/,
  GET_TODAY: /^\/get today$/, // TODO: расширить до 'get yesterday'/ 'get позавчера' и т.д. -> https://github.com/gotois/ProstoDiary_bot/issues/54
  GET_DATE: /^\/get (\d{4}-\d{1,2}-\d{1,2})$/,
  SET_DATE: /^\/set (\d{4}-\d{1,2}-\d{1,2})\s/,
  GRAPH: /^\/graph(\s)/,
  BALANCE: /^\/balance$/,
  COUNT: /^\/count$|\/count\s(.+)/,
  SEARCH: /^\/search(\s)(.+)/,
  KPP: /^\/kpp(\s)(.+)/,
  EDITED_MESSAGE_TEXT: 'edited_message_text',
  TEXT: 'text',
  WEBHOOK_ERROR: 'webhook_error',
  PHOTO: 'photo',
  LOCATION: 'location',
  VOICE: 'voice',
  DOCUMENT: 'document',
};
