const login = process.env.PLOTLY_LOGIN;
const token = process.env.PLOTLY_TOKEN;
const plotly = require('plotly')(login, token);
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
  deletePlot
};
