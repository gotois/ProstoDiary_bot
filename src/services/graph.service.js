const {PLOTLY_LOGIN, PLOTLY_TOKEN} = require('../env');
const plotly = require('plotly')(PLOTLY_LOGIN, PLOTLY_TOKEN);
const {Writable} = require('stream');
const logger = require('../services/logger.service');
/**
 * @param {Object} figure - figure
 * @param {Object} options - options object
 * @returns {Promise}
 */
const getImage = (figure, options = {}) => (
  new Promise((resolve, reject) => (
    plotly.getImage(figure, options, (error, imageStream) => (
      error ? reject(error) : resolve(imageStream)
    ))
  ))
);
/**
 * @param {Object} figure - object figure
 * @param {Object} options - options object
 * @returns {Promise}
 */
const getImageBuffer = async (figure, options = {}) => {
  const imageStream = await getImage(figure, options);
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
      resolve(photoBuffer);
    });
    imageStream.on('error', error => {
      logger.log('error', error.toString());
      reject(error);
    });
  });
};
/**
 * @param {string} plotId - plot id
 * @returns {Promise}
 */
const deletePlot = plotId => (
  new Promise((resolve, reject) => (
    plotly.deletePlot(plotId, (error, plot) => (
      error ? reject(error) : resolve(plot)
    ))
  ))
);

module.exports = {
  getImage,
  getImageBuffer,
  deletePlot,
};
