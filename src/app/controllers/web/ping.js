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
    const values = await apiRequest({
      jsonrpc: '2.0',
      id: 'xxxxx',
      method: 'ping',
    });
    response.contentType('text/html; charset=utf-8').send(values);
  } catch (error) {
    next(createError(400, error.message));
  }
};
