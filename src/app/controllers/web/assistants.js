const template = require('../../views/assistants');

module.exports = (request, response) => {
  response.status(200).send(template());
};
