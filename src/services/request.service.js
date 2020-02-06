// todo перейти на node-fetch?
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
 * @param {object} qs - query string
 * @param {object|undefined} headers - headers
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
        if (response.headers['content-type'].includes('application/json')) {
          resolve(JSON.parse(body));
        }
        return resolve(body);
      },
    );
  });
};
/**
 * @description JSON-RPC 2 запросы
 * @param {string} obj - obj
 * @param {string} obj.url - url
 * @param {object} obj.body - body
 * @param {object} obj.auth - basic auth
 * @returns {Promise<unknown>}
 */
const rpc = ({ url, body, auth }) => {
  const values = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'POST',
        url: url,
        headers: {
          'User-Agent': 'Telegram Assistant/0.0.1',
          'Content-Type': 'application/json',
          'Accept': 'application/schema+json',
          'Content-Length': values.length,
        },
        body: values,
        auth,
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
        return resolve(JSON.parse(body));
      },
    );
  });
};
/**
 * @param {string} url - url
 * @param {object} form - form
 * @param {object|undefined} headers - headers
 * @param {any} encoding - encoding
 * @returns {Promise<string|Buffer|Error>}
 */
const post = (
  url,
  form,
  headers = { 'content-type': 'application/json; charset=UTF-8' },
  encoding = undefined,
  auth = undefined,
) => {
  return new Promise((resolve, reject) => {
    const parameters = {
      method: 'POST',
      url,
      headers,
      form,
      json: true,
    };
    if (encoding !== undefined) {
      parameters.encoding = encoding;
    }
    if (auth !== undefined) {
      parameters.auth = auth;
    }
    request(parameters, (error, response, body) => {
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
    });
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
  rpc,
  get,
  post,
  patch,
  toQueryString,
};
