const dbEntries = require('../../database/entities.database');
const { decodeRows } = require('../../services/format.service');
const { createRegexInput } = require('../../services/text.service');
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
 * @param {object} msg - data
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
 *
 * @param {string} regexString - regexp
 * @returns {string}
 */
const normalizeRegexStringToString = (regexString) => {
  return regexString.replace(/^\//, '').replace(/\/$/, '');
};
function* generateEntries(matchFilterRows) {
  for (let i = 0; i < matchFilterRows.length; i += PAGE_SKIP) {
    yield matchFilterRows.slice(i, i + PAGE_SKIP);
  }
}
/**
 * @deprecated - объединить с v2/search
 * @returns {Promise<void>}
 */
module.exports = async (match, userId, callback) => {
  const input = String(match[3]).trim();
  const rows = await dbEntries.getAll(userId);
  const regExp = createRegexInput(input);
  const matchFilterRows = decodeRows(rows)
    .filter(({ entry }) => {
      return regExp.test(entry);
    })
    .reverse();
  if (matchFilterRows.length === 0) {
    throw new Error('Not found');
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
      const responce = formatResponse({ entry, date, matcher: input });
      await callback(responce, {
        disable_web_page_preview: true,
        parse_mode: 'Markdown',
      });
    });
    await Promise.all(promises);

    if (nextEntries.value.length === PAGE_SKIP && !nextEntries.done) {
      // TODO: говнокод
      await callback(
        'Show next entries',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'NEXT', callback_data: NEXT_PAGE_VALUE }],
            ],
          },
        },
        async (callbackQuery) => {
          if (callbackQuery.data === '__next_page') {
            await showNextEntries();
          }
        },
      );
    }
  };
  const generator = generateEntries(matchFilterRows);
  await showNextEntries();
};
