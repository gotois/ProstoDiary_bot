const dbEntries = require('../database/bot.database');
const sessions = require('../services/session.service');
const bot = require('./../config/bot.config');
const plot = require('../services/graph.service');
const commands = require('../commands/bot.commands');
const crypt = require('../services/crypt.service');
const datetime = require('../services/date.service');
const {createRegexInput} = require('./graph.controller');
/**
 *
 * @type {string}
 */
const BAR_TYPE = 'bar';
/**
 *
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
  const fromId = from.id;
  const currentUser = sessions.getSession(fromId);
  const input = text.replace(commands.GRAPH, '').trim();
  const regExp = createRegexInput(input);
  // временная шкала х {String} и частота y {Number}
  const trace = {
    x: [],
    y: [],
    type: BAR_TYPE
  };
  dbEntries.getAll(currentUser.id).then(({rows}) => {
    if (rows.length <= 0) {
      throw 'Null rows exception';
    }
    const entryRows = rows.map(({date_added, entry}) => ({
      date: date_added,
      entry: crypt.decode(entry)
    })).filter(text => regExp.test(text.entry));
    if (!entryRows.length) {
      throw 'Нет данных для построения графика';
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
  }).then(() => {
    const figure = {'data': [trace]};
    const imgOpts = {
      format: 'png',
      width: 768,
      height: 512
    };
    return plot.getImageBuffer(figure, imgOpts);
    // TODO: если потребуется удаление графиков использовать `return plot.deletePlot('0');`
  }).then(photoBuffer => (
    bot.sendPhoto(chatId, photoBuffer, {
      caption: `График для "${regExp.toString()}"`
    })
  )).catch(error => {
    console.error(error);
    switch (typeof error) {
      case 'string': {
        return bot.sendMessage(chatId, error);
      }
      case 'object': {
        if (error.statusMessage !== NOT_FOUND) {
          return bot.sendMessage(chatId, 'Произошла ошибка при удалении графика с сервера');
        }
        break;
      }
      default: {
        return bot.sendMessage(chatId, 'Произошла неизвестная ошибка');
      }
    }
  });
};

module.exports = getGraph;
