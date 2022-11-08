const e = require('express');
const { homepage } = require('../../../../package.json');
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
    SITEMAP: ${homepage}/sitemap.txt
    `.trim(),
  );
};
