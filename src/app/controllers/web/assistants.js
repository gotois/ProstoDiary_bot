const e = require('express');
const template = require('../../views/assistants');
const { MARKETPLACE } = require('../../../environment');
const apiRequest = require('../../../lib/api').private;

module.exports = class Marketplace {
  /**
   * @description Обновление таблицы ассистентов из env.
   * @param {e.Request} request - request
   * @param {e.Response} response - response
   */
  static async refresh(request, response) {
    // await queue.add('createAssistant', { response });

    try {
      const values = await apiRequest({
        jsonrpc: '2.0',
        id: 'xxxxx',
        method: 'assistant-creates',
        params: MARKETPLACE.ASSISTANTS,
      });
      response.status(200).json(values);
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  /**
   * @param {e.Request} request - request
   * @param {e.Response} response - response
   */
  static async one(request, response) {
    // await queue.add('getAssistant', { response, params: request.params });

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
