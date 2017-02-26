const dbEntries = require('./../database/database.entries.js');
const sessions = require('./../sessions');
const bot = require('./../bot.config.js');
const plot = require('./../plotly.wrapper.js');
const commands = require('./../bot.commands.js');
const crypt = require('./../crypt');
/***
 *
 * @param msg {Object}
 * @return {void}
 */
function getGraph(msg) {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;
  const currentUser = sessions.getSession(fromId);
  const input = msg.text.replace(commands.GRAPH, '').trim();
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
    data.rows.map(row => {
      const entry = crypt.decode(row.entry);
      const date = row.date_added;
      return {
        date,
        entry
      };
    }).filter(text => {
      return text.entry.toUpperCase().includes(input.toUpperCase());
    }).forEach(row => {
      const x = row.date.toLocaleDateString();
      const y = 1;
      const xIndex = trace.x.findIndex(_x => _x === x);
      if (xIndex < 0) {
        trace.x.push(x);
        trace.y.push(y);
      } else {
        ++trace.y[xIndex];
      }
    });
  }).then(() => {
    if (!trace.x.length) {
      throw 'Нет данных для построения графика';
    }
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
      caption: `График для /${input}/`
    });
  }).catch((error) => {
    console.error(error);
    switch (typeof error) {
      case 'string': {
        bot.sendMessage(chatId, error);
        break;
      }
      case 'object': {
        if (error.statusMessage !== 'NOT FOUND') {
          bot.sendMessage(chatId, 'Произошла ошибка при удалении графика с сервера');
        }
        break;
      }
    }
  });
}

module.exports = getGraph;
