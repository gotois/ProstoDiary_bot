const e = require('express');
const apiRequest = require('../../../lib/api').private;

module.exports = class MessageController {
  /**
   * @description Отдаваем последние сообщения по дате
   * @param {e.Request} request - request
   * @param {e.Response} response - response
   */
  static async date(request, response) {
    try {
      const values = await apiRequest({
        jsonrpc: '2.0',
        id: 'xxxxx',
        method: 'get-date-message',
        params: {
          user: request.user,
          ...request.params,
        },
      });
      response.contentType('application/ld+json');
      response.send(values);
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  /**
   * @description Отдаваем последние сообщения
   * @param {e.Request} request - request
   * @param {e.Response} response - response
   */
  static async latest(request, response) {
    try {
      const values = await apiRequest({
        jsonrpc: '2.0',
        id: 'xxxxx',
        method: 'get-latest-message',
        params: {
          user: request.user,
          ...request.params,
        },
      });
      response.contentType('application/ld+json');
      response.send(values);
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  /**
   * @description отображаем первоначальные данные какими они были отправлены
   * @param {e.Request} request - request
   * @param {e.Response} response - response
   */
  static async messageRaw(request, response) {
    try {
      const { contentType, content } = await apiRequest({
        jsonrpc: '2.0',
        id: 'xxxxx',
        method: 'get-raw-message',
        params: {
          user: request.user,
          ...request.params,
        },
      });
      response.contentType(contentType);
      switch (contentType) {
        case 'text/plain': {
          response.send(content.toString('utf8'));
          break;
        }
        case 'application/vnd.geo+json': {
          response.json(JSON.parse(content.toString('utf8')));
          break;
        }
        default: {
          response.send(content);
          break;
        }
      }
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  /**
   * Для доступа к сообщениям, пользователю необходимо вести свой email и master password
   * отображение прикрепленных JSON-LD включающий ссылки на остальные документы
   *
   * @param {e.Request} request - request
   * @param {e.Response} response - response
   */
  static async message(request, response) {
    try {
      const values = await apiRequest({
        jsonrpc: '2.0',
        id: 'xxxxx',
        method: 'get-revision-message',
        params: {
          user: request.user,
          ...request.params,
        },
      });
      response.contentType('application/ld+json');
      response.send(values);
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
};
