// https://github.com/gotois/ProstoDiary_bot/issues/160

const dbEntries = require('../../database/entities.database');
const { decodeRows } = require('../../services/format.service');
const { createRegexInput } = require('../../services/text.service');
const { createPhotoBuffer } = require('../../services/graph.service');
const datetime = require('../../services/date.service');
const correctionText = require('../../services/correction-text.service');
/**
 * @constant
 * @type {number}
 */
const PAGE_SKIP = 1; // default every 10 times
/**
 * @param {object} msg - data
 * @param {Date} msg.date - date
 * @param {string} msg.text - text
 * @param {string} msg.matcher - matcher string
 * @returns {string}
 */
const formatResponse = ({ date, text, matcher }) => {
  const dateOut = `_${date.toLocaleDateString()}_`;
  matcher = matcher.replace(/^\//, '').replace(/\/$/, '');
  const entryOut = text.split(matcher).join(`*${matcher}*`);
  return `${dateOut}\n${entryOut}`;
};
/**
 * @param {Array} rows - matchFilterRows
 * @param {string} input - input
 * @returns {IterableIterator<string>}
 */
function* generateEntries(rows, input) {
  for (let i = 0; i < rows.length; i += PAGE_SKIP) {
    const [{ text, date }] = rows.slice(i, i + PAGE_SKIP);
    const resultFormat = formatResponse({ text, date, matcher: input });
    yield resultFormat;
  }
}
/**
 * @returns {Promise<void>}
 */
module.exports = async (input, userId) => {
  try {
    input = await correctionText(input);

    // todo: нужно разбирать input в том числе через dialogflow (через создание возможности dialogflow context?)
    // ...
    // todo: должно быть естественным языком вида: /search покажи все покупки за прошлую неделю
    // today|last week|last year|etc
    // const rows = await dbEntries.get(currentUser.id, date);

    // еще подключить /count | /get-date

    const rows = await dbEntries.getAll(userId);
    // todo: это нужно перенести внутрь getAll
    // const regExp = createRegexInput(input);
    // console.log('rows', rows)
    // const matchFilterRows = decodeRows(rows)
    // .filter(({ entry }) => {
    //   return regExp.test(entry.toLowerCase());
    // })
    // .reverse();
    // todoend
    if (rows.length === 0) {
      throw new Error('Empty rows');
    }
    const firstDate = rows[0].date;
    const latestDate = rows[rows.length - 1].date;
    const rangeTimes = datetime.fillRangeTimes(firstDate, latestDate);
    const photoBuffer = await createPhotoBuffer(rows, rangeTimes);

    return {
      jsonrpc: '2.0',
      result: {
        // todo: надо возвращать StoryJSON объекты, можно в иттераторе - https://github.com/gotois/ProstoDiary_bot/issues/160#issuecomment-536405332
        generator: generateEntries(rows, input),
        graph: {
          buffer: photoBuffer,
          options: {
            caption: 'График для "xxx"', // fixme `График для "${regExp.toString()}"`,
            parse_mode: 'Markdown',
          },
        },
      },
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      error: {
        message: error.message.toString(),
      },
    };
  }
};
