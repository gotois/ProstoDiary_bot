const e = require('express');
const createError = require('http-errors');
const apiRequest = require('../../../lib/api').private;
/**
 * @param {e.Request} request - request
 * @param {e.Response} response - response
 * @param {e.NextFunction} next - next
 */
module.exports = async (request, response, next) => {
  try {
    // todo Поддержать редирект (307) вида: /thing/.../яблок => /thing/.../яблоко
    // ...
    const values = await apiRequest({
      jsonrpc: '2.0',
      id: 'xxxxx',
      method: 'thing-get',
      params: {
        ...request.params,
      },
    });
    response.contentType('application/ld+json').send(values);
  } catch (error) {
    next(createError(400, error.message));
  }
};
