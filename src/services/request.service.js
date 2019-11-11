const request = require('request');
/**
 * @param {any} body - response body
 * @returns {string}
 */
const formatMessage = (body) => {
  return Buffer.isBuffer(body) ? body.toString('utf8') : body;
};
/**
 * @param {string} url - url
 * @param {object|undefined} headers - headers
 * @param qs
 * @param {any} encoding - encoding
 * @returns {Promise<string|Buffer|Error>}
 */
const get = (url, qs = {}, headers = {}, encoding = null) => {
  return new Promise((resolve, reject) => {
    request.get(
      { url: url + toQueryString(qs), headers, encoding },
      (error, response, body) => {
        if (error) {
          return reject(error);
        }
        if (response.statusCode >= 400) {
          return reject({
            message: formatMessage(body),
            statusCode: response.statusCode,
          });
        }
        if (response.headers['content-type'] === 'application/json') {
          resolve(JSON.parse(body));
        }
        return resolve(body);
      },
    );
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
            message: formatMessage(body),
            statusCode: response.statusCode,
          });
        }
        return resolve(body);
      },
    );
  });
};

const patch = (
  url,
  form,
  headers = { 'content-type': 'application/json; charset=UTF-8' },
) => {
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'PATCH',
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
            message: formatMessage(body),
            statusCode: response.statusCode,
          });
        }
        return resolve(body);
      },
    );
  });
};
/**
 * @todo заменить на библиотеку qs
 * @description Serialization
 * @param {object} data - data
 * @returns {string}
 */
const toQueryString = (data) => {
  const items = Object.entries(data)
    .filter(([_key, value]) => {
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
  patch,
  toQueryString,
};
