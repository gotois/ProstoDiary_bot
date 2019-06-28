const request = require('request');
/**
 * @param {string} url - url
 * @param {object|undefined} headers - headers
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
        return reject({
          message: body.toString('utf8'),
          statusCode: response.statusCode,
        });
      }
      return resolve(body);
    });
  });
};
/**
 * @param {string} url - url
 * @param {object} form - form
 * @param {object|undefined} headers - headers
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
          return reject({
            message: body.toString('utf8'),
            statusCode: response.statusCode,
          });
        }
        return resolve(body);
      },
    );
  });
};
/**
 * @description Serialization
 * @param {object} data - data
 * @returns {string}
 */
const toQueryString = (data) => {
  const items = Object.entries(data)
    // eslint-disable-next-line no-unused-vars
    .filter(([key, value]) => {
      switch (typeof value) {
        case 'object':
          return value !== null;
        case 'undefined':
          return value !== undefined;
        case 'string':
          return value.length > 0;
        default:
          return true;
      }
    })
    .map(([key, value]) => {
      return `${key}=${value}`;
    });
  return items.length > 0 ? `?${items.join('&')}` : '';
};

module.exports = {
  get,
  post,
  toQueryString,
};
