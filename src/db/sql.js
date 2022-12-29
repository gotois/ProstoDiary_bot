const {
  createPool,
  sql,
  // NotFoundError,
  // DataIntegrityError,
  // UniqueIntegrityConstraintViolationError,
} = require('slonik');
const {
  createQueryLoggingInterceptor,
} = require('slonik-interceptor-query-logging');
const { DATABASE } = require('../environment');

const interceptors = [createQueryLoggingInterceptor()];
const pool = createPool(DATABASE.POSTGRES_CONNECTION_STRING, {
  interceptors,
});

// todo как показывает код - использую только pool, остальное нужно будет импортить напрямую из slonik
module.exports = {
  pool,
  sql,
  // UniqueIntegrityConstraintViolationError,
  // DataIntegrityError,
  // NotFoundError,
};
