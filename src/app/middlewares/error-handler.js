const logger = require('../../lib/log');

module.exports = (error, request, response, next) => {
  logger.error(error.stack);
  response.status(error.status || 500).json(error.errors);
  next(error); // вызов next обязателен, иначе обработчик не срабатывает
};
