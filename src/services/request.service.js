const request = require('request');
/**
 * @param {string} url - url
 * @param {Object|undefined} headers - headers
 * @param {any} encoding - encoding
 * @returns {Promise<string|Buffer|Error>}
 */
const get = (url, headers = {}, encoding = null) => {
  return new Promise((resolve, reject) => {
    request.get({ url, headers, encoding }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      if (response.statusCode >= 400) {
        return reject(body.toString('utf8'));
      }
      return resolve(body);
    });
  });
};
/**
 * @param {string} url - url
 * @param {Object} form - form
 * @param {Object|undefined} headers - headers
 * @returns {Promise<string|Buffer|Error>}
 */
const post = (
  url,
  form,
  headers = { 'content-type': 'application/json; charset=UTF-8' },
) => {
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'POST',
        url,
        headers,
        form,
        json: true,
      },
      (error, response, body) => {
        if (error) {
          return reject(error);
        }
        if (response.statusCode >= 400) {
          return reject(body.toString('utf8'));
        }
        return resolve(body);
      },
    );
  });
};
module.exports = {
  get,
  post,
};
