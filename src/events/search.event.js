const bot = require('../bot');
const dbEntries = require('../database/entities.database');
const sessions = require('../services/session.service');
const logger = require('../services/logger.service');
const { decodeRows } = require('../services/format.service');
const {
  createRegexInput,
  normalizeRegexStringToString,
} = require('../services/input.service');
/**
 * @constant
 * @type {number}
 */
const PAGE_SKIP = 10; // default every 10 times
/**
 * @constant
 * @type {string}
 */
const NEXT_PAGE_VALUE = '__next_page';
/**
 * @param {Object} msg - data
 * @param {Date} msg.date - date
 * @param {string} msg.entry - entry
 * @param {string} msg.matcher - matcher string
 * @returns {string}
 */
const formatResponse = ({ date, entry, matcher }) => {
  const dateOut = `_${date.toLocaleDateString()}_`;
  matcher = normalizeRegexStringToString(matcher);
  const entryOut = entry.split(matcher).join(`*${matcher}*`);
  return `${dateOut}\n${entryOut}`;
};
/**
 * @param {Object} msg - message
 * @param {Object} msg.chat - chat
 * @param {Object} msg.from - from
 * @param {Array} match - match
 * @returns {undefined}
 */
const onSearch = async ({ chat, from }, match) => {
  logger.log('info', onSearch.name);
  const chatId = chat.id;
  const fromId = from.id;
  const currentUser = sessions.getSession(fromId);
  const { rows } = await dbEntries.getAll(currentUser.id);
  const input = String(match[2]).trim();
  const regExp = createRegexInput(input);
  const matchFilterRows = decodeRows(rows).filter(({ entry }) => {
    return regExp.test(entry);
  });
  if (!matchFilterRows.length) {
    await bot.sendMessage(chatId, 'Not found');
    return;
  }
  /**
   * @param {*} entry - entry
   * @param {*} date - date
   * @returns {Promise<undefined>}
   */
  const botSendMessage = async ({ entry, date }) => {
    await bot.sendMessage(
      chatId,
      formatResponse({ entry, date, matcher: input }),
      {
        disable_web_page_preview: true,
        parse_mode: 'Markdown',
      },
    );
  };
  /**
   * @param {number} page - page
   * @returns {Promise<undefined>}
   */
  function* generateEntries(page) {
    for (let i = 0; i < matchFilterRows.length; i += page) {
      yield matchFilterRows.slice(i, i + page);
    }
  }
  /**
   *
   * @returns {Promise<undefined>}
   */
  const showNextEntries = async () => {
    const nextEntries = generator.next();
    if (!nextEntries.value) {
      return;
    }
    const promises = nextEntries.value.map(async ({ entry, date }) => {
      await botSendMessage({ entry, date });
    });
    await Promise.all(promises);

    if (nextEntries.value.length === PAGE_SKIP && !nextEntries.done) {
      await bot.sendMessage(chatId, 'Show next entries', {
        reply_markup: {
          inline_keyboard: [[{ text: 'NEXT', callback_data: NEXT_PAGE_VALUE }]],
        },
      });
      bot.once('callback_query', async (callbackQuery) => {
        if (callbackQuery.data === NEXT_PAGE_VALUE) {
          await showNextEntries();
        }
      });
    }
  };
  const generator = generateEntries(PAGE_SKIP);
  await showNextEntries();
};

module.exports = onSearch;
