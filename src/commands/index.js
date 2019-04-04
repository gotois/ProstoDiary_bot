/**
 * @type {Object}
 */
module.exports = {
  PING: /^\/ping$/,
  DOWNLOAD: /^\/download$/,
  DB_CLEAR: /^\/dbclear$/,
  START: /^\/start$/,
  HELP: /^\/help$/,
  VERSION: /^\/version$/,
  GET_TODAY: /^\/get today$/,
  GET_DATE: /^\/get (\d{4}-\d{1,2}-\d{1,2})$/,
  SET_DATE: /^\/set (\d{4}-\d{1,2}-\d{1,2})\s/,
  GRAPH: /^\/graph(\s)/,
  COUNT: /^\/count$|\/count\s(.+)/,
  SEARCH: /^\/search(\s)(.+)/,
  EDITED_MESSAGE_TEXT: 'edited_message_text',
  TEXT: 'text',
  WEBHOOK_ERROR: 'webhook_error',
  PHOTO: 'photo',
  LOCATION: 'location',
  VOICE: 'voice',
};
