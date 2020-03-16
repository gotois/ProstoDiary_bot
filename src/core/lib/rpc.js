const request = require('request');
const package_ = require('../../../package');
const { SERVER } = require('../../environment');
/**
 * @description JSON-RPC 2 request
 * @param {string} obj - obj
 * @param {object} obj.body - body
 * @param {object} obj.auth - basic auth
 * @returns {Promise<*>}
 */
module.exports = ({ body, auth, jwt }) => {
  return new Promise((resolve, reject) => {
    const values = JSON.stringify(body);
    const parameters = {
      method: 'POST',
      url: SERVER.HOST + '/api',
      headers: {
        'User-Agent': `${package_.name}/${package_.version}`,
        'Content-Type': 'application/json',
        'Accept': 'application/schema+json',
        'Content-Length': values.length,
      },
      body: values,
    };
    if (jwt) {
      parameters.headers['Authorization'] = 'Bearer ' + jwt;
    }
    if (auth) {
      parameters.auth = auth;
    }
    request(parameters, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      if (response.statusCode >= 400) {
        return reject({
          message: body || response.statusMessage,
          statusCode: response.statusCode,
        });
      }
      if (!body) {
        return reject({
          message: 'body empty',
          statusCode: 400,
        });
      }
      return resolve(JSON.parse(body));
    });
  });
};
