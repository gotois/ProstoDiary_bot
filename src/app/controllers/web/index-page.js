const e = require('express');
const template = require('../../public/views');
/**
 * @param {e.Request} request - request
 * @param {e.Response} response - response
 */
module.exports = (request, response) => {
  response.status(200).send(template());
};
