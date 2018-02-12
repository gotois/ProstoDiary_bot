const dbEntries = require('../database');
const sessions = require('../services/session.service');
const bot = require('../config');
const {decodeRows} = require('../services/format.service');
const {createRegexInput, normalizeRegexStringToString} = require('../services/input.service');
/**
 * @param date {Date}
 * @param entry {String}
 * @param matcher {String}
 * @return {String}
 */
const formatResponse = ({date, entry, matcher}) => {
  const dateOut = `_${date.toLocaleDateString()}_`;
  matcher = normalizeRegexStringToString(matcher);
  const entryOut = entry.split(matcher).join(`*${matcher}*`);
  return `${dateOut}\n${entryOut}`;
};
/**
 * @param chat {Object}
 * @param from {Object}
 * @param match {Array}
 * @return {void}
 */
const onSearch = async ({chat, from}, match) => {
  const chatId = chat.id;
  const fromId = from.id;
  const currentUser = sessions.getSession(fromId);
  const {rows} = await dbEntries.getAll(currentUser.id);
  const input = String(match[2]).trim();
  const regExp = createRegexInput(input);
  const matchFilterRows = decodeRows(rows).filter(({entry}) => regExp.test(entry));
  if (!matchFilterRows.length) {
    await bot.sendMessage(chatId, 'Not found');
    return;
  }
  matchFilterRows.forEach(async ({entry, date}) => (
    await bot.sendMessage(chatId, formatResponse({entry, date, matcher: input}), {
      'disable_web_page_preview': true,
      'parse_mode': 'Markdown',
    })
  ));
};

module.exports = onSearch;
