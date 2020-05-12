const template = require('../../views');
/**
 * @param {Request} request - request
 * @param {Response} response - response
 */
module.exports = (request, response) => {
  response.status(200).send(template());
};
