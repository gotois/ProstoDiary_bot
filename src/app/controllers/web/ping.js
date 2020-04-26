const template = require('../../views/ping');

module.exports = (request, response) => {
  response.contentType('text/html; charset=utf-8').send(template());
};
