const { PLOTLY } = require('../env');
const plotly = require('plotly')(PLOTLY.PLOTLY_LOGIN, PLOTLY.PLOTLY_TOKEN);
const { Writable } = require('stream');
/**
 * @returns {{x: Array, y: Array, type: string}}
 */
const createTrace = () => {
  /**
   * @constant {string}
   */
  const BAR_TYPE = 'bar';
  return {
    x: [],
    y: [],
    type: BAR_TYPE,
  };
};
/**
 * @returns {{format: string, width: number, height: number}}
 */
const figureOptions = {
  format: 'png',
  width: 768,
  height: 512,
};
/**
 * @param {Object} figure - figure
 * @param {Object} options - options object
 * @returns {Promise<Buffer>}
 */
const getPlotlyImage = (figure, options = {}) => {
  return new Promise((resolve, reject) => {
    return plotly.getImage(figure, options, (error, imageStream) => {
      if (error) {
        return reject(error);
      }
      return resolve(imageStream);
    });
  });
};
/**
 * @param {Object} figure - object figure
 * @param {Object} options - options object
 * @returns {Promise<Buffer>}
 */
const getImageBuffer = async (figure, options = {}) => {
  const imageStream = await getPlotlyImage(figure, options);
  return new Promise((resolve, reject) => {
    const ws = Writable();
    const buffers = [];
    ws._write = (chunk, enc, next) => {
      buffers.push(chunk);
      next();
    };
    imageStream.pipe(ws);
    imageStream.on('end', () => {
      const photoBuffer = Buffer.concat(buffers);
      return resolve(photoBuffer);
    });
    imageStream.on('error', (error) => {
      return reject(error);
    });
  });
};
/**
 * @param {string} plotId - plot id
 * @returns {Promise}
 */
const deletePlot = (plotId) => {
  return new Promise((resolve, reject) => {
    return plotly.deletePlot(plotId, (error, plot) => {
      if (error) {
        return reject(error);
      }
      return resolve(plot);
    });
  });
};
/**
 * @param {string|Date} date - date
 */
const getDateString = (date) => {
  if (typeof date === 'string') {
    return date;
  } else {
    return date.toLocaleDateString();
  }
};
/**
 * @param {Array} entryRows - rows
 * @param {Array<string|Date>} rangeTimes - rangeTimes
 * @returns {Promise<Error|Buffer>}
 */
const createPhotoBuffer = async (entryRows, rangeTimes) => {
  if (!entryRows.length) {
    throw new Error('Нет данных для построения графика');
  }
  const trace = createTrace();
  rangeTimes.forEach((_date) => {
    const traceX = getDateString(_date);
    const traceY = entryRows.filter(({ date }) => {
      return getDateString(date) === traceX;
    }).length;
    const xIndex = trace.x.findIndex((_x) => {
      return _x === traceX;
    });
    if (xIndex < 0) {
      trace.x.push(traceX);
      trace.y.push(traceY);
    } else {
      ++trace.y[xIndex];
    }
  });
  const figure = { data: [trace] };
  const photoBuffer = await getImageBuffer(figure, figureOptions);
  return photoBuffer;
};

module.exports = {
  createPhotoBuffer,
  // TODO: если потребуется удаление графиков использовать `return plot.deletePlot('0');`
  deletePlot,
};
