const dbEntries = require('./../database/database.entries.js');
const sessions = require('./../sessions');
const bot = require('./../bot.config.js');
const plot = require('./../plotly.wrapper.js');
const commands = require('./../bot.commands.js');
const crypt = require('./../crypt');
const datetime = require('./../datetime');
/***
 * Построить график
 * @param msg {Object}
 * @return {void}
 */
function getGraph(msg) {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;
  const currentUser = sessions.getSession(fromId);
  const input = msg.text.replace(commands.GRAPH, '').trim();
  const regExp = isRegexString(input) ? convertStringToRegexp(input) : createRegExp(input);
  // временная шкала х {String} и частота y {Number}
  const trace = {
    x: [],
    y: [],
    type: 'bar'
  };
  dbEntries.getAll(currentUser.id).then(data => {
    if (data.rows.length <= 0) {
      throw 'Null rows exception';
    }
    const entryRows = data.rows.map(row => {
      const entry = crypt.decode(row.entry);
      const date = row.date_added;
      return {
        date,
        entry
      };
    }).filter(text => {
      return regExp.test(text.entry);
    });
    if (!entryRows.length) {
      throw 'Нет данных для построения графика';
    }
    const firstDate = data.rows[0].date_added;
    const latestDate = data.rows[data.rows.length - 1].date_added;
    const rangeTimes = datetime.fillRangeTimes(firstDate, latestDate);
    rangeTimes.forEach(_date => {
      const findedCount = entryRows.filter(_ => {
        return _.date.toLocaleDateString() === _date.toLocaleDateString();
      });
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
  }).then(photoBuffer => {
    return bot.sendPhoto(chatId, photoBuffer, {
      caption: `График для "${regExp.toString()}"`
    });
  }).catch(error => {
    console.error(error);
    switch (typeof error) {
      case 'string': {
        return bot.sendMessage(chatId, error);
      }
      case 'object': {
        if (error.statusMessage !== 'NOT FOUND') {
          return bot.sendMessage(chatId, 'Произошла ошибка при удалении графика с сервера');
        }
        break;
      }
      default: {
        return bot.sendMessage(chatId, 'Произошла неизвестная ошибка');
      }
    }
  });
}
/**
 *
 * @param word {String}
 * @return {RegExp}
 */
function createRegExp(word) {
  return new RegExp(`( ${word} )|( ${word}$)|(^${word} )|(^${word}$)`, 'i');
}
/**
 *
 * @param string {String}
 * @return {boolean}
 */
function isRegexString(string) {
  if (string[0] === '/' && string[string.length - 1] === '/') {
    return true;
  }
  return false;
}
/**
 *
 * @param string {String}
 * @return {RegExp}
 */
function convertStringToRegexp(string) {
  return new RegExp(string.slice(1, string.length - 1));
}

module.exports = getGraph;
