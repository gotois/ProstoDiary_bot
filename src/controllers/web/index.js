const template = require('../../views');

module.exports = (request, response) => {
  response.status(200).send(template());
};
