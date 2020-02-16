const template = require('../../views/ping');

module.exports = (request, response) => {
  response.status(200).send(template());
};
