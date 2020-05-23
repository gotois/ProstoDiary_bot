const e = require('express');
const apiRequest = require('../../../lib/api').private;
/**
 * @param {e.Request} request - request
 * @param {e.Response} response - response
 */
module.exports = async (request, response) => {
  try {
    const values = await apiRequest({
      jsonrpc: '2.0',
      id: 'xxxxx',
      method: 'user-passport',
      params: {
        ...request.params,
      },
    });
    response.contentType('application/ld+json').send(values);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};
