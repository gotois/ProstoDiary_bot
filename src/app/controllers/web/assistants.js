const e = require('express');
const template = require('../../public/views/assistants');
const apiRequest = require('../../../lib/api').private;

module.exports = class Marketplace {
  /**
   * @param {e.Request} request - request
   * @param {e.Response} response - response
   */
  static async one(request, response) {
    try {
      const client = await apiRequest({
        jsonrpc: '2.0',
        id: 'xxxxx',
        method: 'assistant-one',
        params: request.params,
      });
      response.status(200).json(client);
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  /**
   * @param {e.Request} request - request
   * @param {e.Response} response - response
   */
  static async assistants(request, response) {
    try {
      const clients = await apiRequest({
        jsonrpc: '2.0',
        id: 'xxxxx',
        method: 'assistant-many',
      });
      response.status(200).send(
        template({
          clients,
        }),
      );
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
};
