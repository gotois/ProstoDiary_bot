const apiRequest = require('../../../lib/api').private;
/**
 * @param {Request} request - request
 * @param {Response} response - response
 */
module.exports = async (request, response) => {
  try {
    const values = await apiRequest({
      jsonrpc: '2.0',
      id: 'xxxxx',
      method: 'ping',
    });
    response.contentType('text/html; charset=utf-8').send(values);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};
