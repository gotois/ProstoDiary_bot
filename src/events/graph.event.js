const dbEntries = require('../database/bot.database');
const sessions = require('../services/session.service');
const bot = require('./../config/bot.config');
const plot = require('../services/graph.service');
const commands = require('../commands/bot.commands');
const datetime = require('../services/date.service');
const {createRegexInput} = require('../services/input.service');
const {decodeRows} = require('./../services/format.service');
/**
 * @type {string}
 */
const BAR_TYPE = 'bar';
/**
 * @type {string}
 */
const NOT_FOUND = 'NOT FOUND';
/***
 * Построить график
 * @param msg {Object}
 * @param msg.chat {Object}
 * @param msg.from {Object}
 * @param msg.text {String}
 * @return {void}
 */
const getGraph = async ({chat, from, text}) => {
  const chatId = chat.id;
  const currentUser = sessions.getSession(from.id);
  const input = text.replace(commands.GRAPH, '').trim();
  const regExp = createRegexInput(input);
  // временная шкала х {String} и частота y {Number}
  const trace = {
    x: [],
    y: [],
    type: BAR_TYPE,
  };
  try {
    const {rows} = await dbEntries.getAll(currentUser.id);
    const entryRows = decodeRows(rows).filter(({entry}) => regExp.test(entry));
    if (!entryRows.length) {
      throw new Error('Нет данных для построения графика');
    }
    const firstDate = rows[0].date_added;
    const latestDate = rows[rows.length - 1].date_added;
    const rangeTimes = datetime.fillRangeTimes(firstDate, latestDate);
    rangeTimes.forEach(_date => {
      const findedCount = entryRows.filter(({date}) => (
        date.toLocaleDateString() === _date.toLocaleDateString())
      );
      const x = _date.toLocaleDateString();
      const y = findedCount.length;
      const xIndex = trace.x.findIndex(_x => _x === x);
      if (xIndex < 0) {
        trace.x.push(x);
        trace.y.push(y);
      } else {
        ++trace.y[xIndex];
      }
    });
    const figure = {'data': [trace]};
    const imgOpts = {
      format: 'png',
      width: 768,
      height: 512
    };
    // TODO: если потребуется удаление графиков использовать `return plot.deletePlot('0');`
    const photoBuffer = await plot.getImageBuffer(figure, imgOpts);
    await bot.sendPhoto(chatId, photoBuffer, {
      'caption': `График для "${regExp.toString()}"`,
      'parse_mode': 'Markdown',
    });
  } catch (error) {
    console.error(error);
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
