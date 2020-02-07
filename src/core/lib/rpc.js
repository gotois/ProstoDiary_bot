const request = require('request');
const package_ = require('../../../package');
const { SERVER } = require('../../environment');
/**
 * @description JSON-RPC 2 request
 * @param {string} obj - obj
 * @param {object} obj.body - body
 * @param {object} obj.auth - basic auth
 * @returns {Promise<unknown>}
 */
module.exports = ({ body, auth }) => {
  const values = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'POST',
        url: SERVER.HOST + '/api',
        headers: {
          'User-Agent': `${package_.name}/${package_.version}`,
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
            message: body,
            statusCode: response.statusCode,
          });
        }
        return resolve(JSON.parse(body));
      },
    );
  });
};
