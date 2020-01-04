const { website } = require('../../app');

module.exports = (request, response) => {
  response.type('text/plain');
  response.status(200).send(
    `
      ${website}
    `.trim(),
  );
};
