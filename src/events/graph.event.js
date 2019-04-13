const bot = require('../bot');
const dbEntries = require('../database/entities.database');
const sessions = require('../services/session.service');
const plot = require('../services/graph.service');
const commands = require('../commands');
const datetime = require('../services/date.service');
const { createRegexInput } = require('../services/input.service');
const { decodeRows } = require('./../services/format.service');
const logger = require('./../services/logger.service');
/**
 * @constant {string}
 */
const BAR_TYPE = 'bar';
/**
 * @constant {string}
 */
const NOT_FOUND = 'NOT FOUND';
/**
 * временная шкала х {String} и частота y {Number}
 *
 * @returns {{x: Array, y: Array, type: string}}
 */
const createTrace = () => {
  return {
    x: [],
    y: [],
    type: BAR_TYPE,
  };
};
/**
 * @returns {{format: string, width: number, height: number}}
 */
const getImgOpts = () => {
  return {
    format: 'png',
    width: 768,
    height: 512,
  };
};
/**
 * @param {Array} entryRows - rows
 * @param {Array} rangeTimes - rangeTimes
 * @returns {Promise<undefined>}
 */
const createPhotoBuffer = async (entryRows, rangeTimes) => {
  const trace = createTrace();
  if (!entryRows.length) {
    throw new Error('Нет данных для построения графика');
  }
  rangeTimes.forEach((_date) => {
    const findedCount = entryRows.filter(({ date }) => {
      return date.toLocaleDateString() === _date.toLocaleDateString();
    });
    const x = _date.toLocaleDateString();
    const y = findedCount.length;
    const xIndex = trace.x.findIndex((_x) => {
      return _x === x;
    });
    if (xIndex < 0) {
      trace.x.push(x);
      trace.y.push(y);
    } else {
      ++trace.y[xIndex];
    }
  });
  const figure = { data: [trace] };
  const imgOpts = getImgOpts();
  // TODO: если потребуется удаление графиков использовать `return plot.deletePlot('0');`
  const photoBuffer = await plot.getImageBuffer(figure, imgOpts);
  return photoBuffer;
};

/**
 * Построить график
 *
 * @param {Object} msg - message
 * @param {Object} msg.chat - message chat
 * @param {Object} msg.from - from
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
    const { rows } = await dbEntries.getAll(currentUser.id);
    const entryRows = decodeRows(rows).filter(({ entry }) => {
      return regExp.test(entry.toLowerCase());
    });
    const firstDate = rows[0].date_added;
    const latestDate = rows[rows.length - 1].date_added;
    const rangeTimes = datetime.fillRangeTimes(firstDate, latestDate);
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
