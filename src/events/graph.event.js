const bot = require('../bot');
const dbEntries = require('../database/entities.database');
const sessions = require('../services/session.service');
const { createPhotoBuffer } = require('../services/graph.service');
const commands = require('../commands');
const datetime = require('../services/date.service');
const { createRegexInput } = require('../services/text.service');
const { decodeRows } = require('./../services/format.service');
const logger = require('./../services/logger.service');
/**
 * @constant {string}
 */
const NOT_FOUND = 'NOT FOUND';
/**
 * Построить график
 *
 * @todo rename -> getPlot
 * @param {object} msg - message
 * @param {object} msg.chat - message chat
 * @param {object} msg.from - from
 * @param {string} msg.text - text
 * @returns {undefined}
 */
const getGraph = async ({ chat, from, text }) => {
  logger.log('info', getGraph.name);
  const chatId = chat.id;
  const currentUser = sessions.getSession(from.id);
  const input = text
    .replace(commands.GRAPH, '')
    .trim()
    .toLowerCase();
  const regExp = createRegexInput(input);
  try {
    const rows = await dbEntries.getAll(currentUser.id);
    const entryRows = decodeRows(rows).filter(({ entry }) => {
      return regExp.test(entry.toLowerCase());
    });
    const firstDate = rows[0].date_added;
    const latestDate = rows[rows.length - 1].date_added;
    const rangeTimes = datetime.fillRangeTimes(firstDate, latestDate);
    // TODO: из entryRows нужен только date
    const photoBuffer = await createPhotoBuffer(entryRows, rangeTimes);
    await bot.sendPhoto(chatId, photoBuffer, {
      caption: `График для "${regExp.toString()}"`,
      parse_mode: 'Markdown',
    });
  } catch (error) {
    logger.log('error', error.toString());
    switch (typeof error) {
      case 'string': {
        await bot.sendMessage(chatId, error);
        return;
      }
      case 'object': {
        if (error.statusMessage !== NOT_FOUND) {
          await bot.sendMessage(chatId, 'Нет данных');
          return;
        }
        break;
      }
      default: {
        await bot.sendMessage(chatId, 'Произошла неизвестная ошибка');
        return;
      }
    }
  }
};

module.exports = getGraph;
