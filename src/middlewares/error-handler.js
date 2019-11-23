const logger = require('../services/logger.service');

module.exports = (error, request, response, next) => {
  logger.warn(error.stack);
  response.status(error.status).json(error.errors);
  next(); // вызов next обязателен, иначе обработчик не срабатывает
};
