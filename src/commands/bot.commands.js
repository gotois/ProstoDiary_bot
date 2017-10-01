/**
 *
 * @type {Object}
 */
module.exports = {
  'DOWNLOAD': /^\/download$/,
  'DBCLEAR': /^\/dbclear/,
  'START': /^\/start/,
  'HELP': /^\/help$/,
  'GETDATE': /^\/get (\d{1,2}\.\d{1,2}\.\d{4})$/,
  'SETDATE': /^\/set (\d{1,2}\.\d{1,2}\.\d{4})\s/,
  'GRAPH': /^\/graph(\s)/,
  'COUNT': /^\/count(\s)(.+)/,
  'SEARCH': /^\/search(\s)(.+)/,
  'EDITED_MESSAGE_TEXT': 'edited_message_text',
  'TEXT': 'text',
};
