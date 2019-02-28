const request = require('request');
/**
 * @param {string} url - url
 * @param {Object|undefined} headers - headers
 * @param {any} encoding - encoding
 * @returns {Promise<any>}
 */
const get = (url, headers = {}, encoding = null) => {
  return new Promise((resolve, reject) => {
    request.get({ url, headers, encoding }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      return resolve(body);
    });
  });
};
/**
 * @param {string} url - url
 * @param {Object} form - form
 * @param {Object|undefined} headers - headers
 * @returns {Promise<any>}
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
        resolve(body);
      },
    );
  });
};
module.exports = {
  get,
  post,
};
