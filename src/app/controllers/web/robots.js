const e = require('express');
const { website } = require('../../../../app.json');
/**
 * @param {e.Request} request - request
 * @param {e.Response} response - response
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
