const template = require('../../views/ping');
/**
 * @param {Request} request - request
 * @param {Response} response - response
 */
module.exports = (request, response) => {
  response.contentType('text/html; charset=utf-8').send(template());
};
