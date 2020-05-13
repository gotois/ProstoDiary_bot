const { website } = require('../../../../app.json');
/**
 * @param {Request} request - request
 * @param {Response} response - response
 */
module.exports = (request, response) => {
  response.type('text/plain');
  response.send(
    `
    User-agent: *
    Disallow: /
    SITEMAP: ${website}/sitemap.txt
    `.trim(),
  );
};
