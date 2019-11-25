const logger = require('../services/logger.service');

module.exports = (error, request, response, next) => {
  logger.error(error.stack);
  response.status(error.status || 500).json(error.errors);
  next(); // вызов next обязателен, иначе обработчик не срабатывает
};
