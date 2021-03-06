const request = require('request');
const package_ = require('../../package.json');
const { SERVER, IS_AVA } = require('../environment');
let supertest;
if (IS_AVA) {
  supertest = require('supertest');
}
/**
 * @param {Buffer|string} body - response body
 * @returns {string}
 */
const formatMessage = (body) => {
  return Buffer.isBuffer(body) ? body.toString('utf8') : body;
};
/**
 * @description JSON-RPC2 API request
 * @param {string} obj - obj
 * @param {object} obj.body - body
 * @param {object} obj.auth - basic auth
 * @param {string} obj.verification - verification signatures Ed25519Signature2018
 * @returns {Promise<*>}
 */
const rpc = ({ body, auth, jwt, verification }) => {
  // logger.info('rpc');
  const parameters = {
    method: 'POST',
    url: SERVER.HOST + '/api',
    headers: {
      'User-Agent': `${package_.name}/${package_.version}`,
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/schema+json',
    },
    body,
    json: true,
  };
  if (verification) {
    parameters.headers['verification'] = verification;
  }
  if (jwt) {
    parameters.headers['Authorization'] = 'Bearer ' + jwt;
  }
  if (auth) {
    parameters.auth = auth;
  }
  // hack переопределяем для тестов моковый сервер
  if (IS_AVA) {
    return supertest(global.app)
      .post('/api')
      .send({
        method: parameters.method,
        url: 'http://' + parameters.url,
        headers: parameters.headers,
        body,
      })
      .then((response) => {
        return response.body.result;
      });
  }
  return new Promise((resolve, reject) => {
    request(parameters, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      if (!body) {
        return reject({
          message: 'Unknown empty body',
          statusCode: 500,
        });
      }
      if (response.statusCode >= 400) {
        return reject({
          message: body.error,
          statusCode: response.statusCode,
        });
      }
      return resolve(body);
    });
  });
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
 * @param {string} url - url
 * @param {object} form - form
 * @param {object} [headers] - headers
 * @param {any} [encoding] - encoding
 * @param {object} [auth] - basic auth
 * @returns {Promise<string|Buffer|Error>}
 */
const post = (
  url,
  form,
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  headers = { 'content-type': 'application/json; charset=UTF-8' },
  encoding,
  auth,
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
/**
 * @param {string} url - url
 * @param {object} form - form
 * @param {object} headers - headers
 * @returns {Promise<*>}
 */
const patch = (
  url,
  form,
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
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
