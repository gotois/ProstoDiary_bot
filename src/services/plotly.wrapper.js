const {PLOTLY_LOGIN, PLOTLY_TOKEN} = process.env;
const plotly = require('plotly')(PLOTLY_LOGIN, PLOTLY_TOKEN);
const {Writable} = require('stream');
/**
 *
 * @param figure {Object}
 * @param options {Object}
 * @returns {Promise}
 */
function getImage(figure, options = {}) {
  return new Promise((resolve, reject) => {
    plotly.getImage(figure, options, (error, imageStream) => {
      if (error) {
        return reject(error);
      }
      resolve(imageStream);
    });
  });
}
/**
 *
 * @param figure {Object}
 * @param options {Object}
 * @returns {Promise}
 */
function getImageBuffer(figure, options = {}) {
  return getImage(figure, options).then(imageStream => {
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
        console.error(error);
        reject(error);
      });
    });
  });
}
/**
 *
 * @param plotId {String}
 * @returns {Promise}
 */
function deletePlot(plotId) {
  return new Promise((resolve, reject) => {
    plotly.deletePlot(plotId, (error, plot) => {
      if (error) {
        return reject(error);
      }
      resolve(plot);
    });
  });
}

module.exports = {
  getImage,
  getImageBuffer,
  deletePlot,
};
