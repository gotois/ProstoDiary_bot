const request = require('request');
/**
 * @param url {String}
 * @returns {Promise<any>}
 */
const get = url => new Promise((resolve, reject) => {
  request.get({url, encoding: null}, (error, response, body) => {
    if (error) {
      return reject(error);
    }
    return resolve(body);
  });
});

module.exports = {
  get,
};
