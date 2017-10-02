const dbEntries = require('../database/bot.database');
const sessions = require('../services/session.service');
const bot = require('./../config/bot.config');
const {decodeRows} = require('./../services/format.service');
/**
 * @param date {Date}
 * @param entry {String}
 * @param matcher {String}
 * @return {String}
 */
const formatResponse = ({date, entry, matcher}) => {
  const dateOut = `_${date.toLocaleDateString()}_`;
  const entryOut = entry.replace(new RegExp(matcher, 'gi'), `*${matcher}*`);
  return `${dateOut}\n${entryOut}`;
};
/**
 * @param chat
 * @param from
 * @param match
 * @return {void}
 */
const onSearch = async ({chat, from}, match) => {
  const chatId = chat.id;
  const fromId = from.id;
  const currentUser = sessions.getSession(fromId);
  const {rows} = await dbEntries.getAll(currentUser.id);
  const matcher = match[2];
  const matchFilterRows = decodeRows(rows).filter(({entry}) => {
    if (entry.toUpperCase().includes(matcher.toUpperCase())) {
      return true;
    }
    return false;
  });
  if (!matchFilterRows.length) {
    await bot.sendMessage(chatId, 'Not found');
    return;
  }
  matchFilterRows.forEach(async ({entry, date}) => (
    await bot.sendMessage(chatId, formatResponse({entry, date, matcher}), {
      'disable_web_page_preview': true,
      'parse_mode': 'Markdown',
    })
  ));
};

module.exports = onSearch;
