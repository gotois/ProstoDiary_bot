const apiRequest = require('../../../lib/api').private;

module.exports = class Bot {
  /**
   * @description Авторизация и разблокировка чтения/приема и общей работы бота
   * @param {Request} request - request
   * @param {Response} response - response
   */
  static async signin(request, response) {
    try {
      const values = await apiRequest({
        jsonrpc: '2.0',
        id: 'xxxxx',
        method: 'bot-sign-in',
        params: {
          session: request.session,
          ...request.params,
        },
      });
      response.status(200).send(values);
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  /**
   * @description Блокировка чтения/приема сообщений к боту
   * @param {Request} request - request
   * @param {Response} response - response
   */
  static async signout(request, response) {
    try {
      const values = await apiRequest({
        jsonrpc: '2.0',
        id: 'xxxxx',
        method: 'bot-sign-out',
        params: {
          session: request.session,
          ...request.params,
        },
      });
      response.status(200).send(values);
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
};
