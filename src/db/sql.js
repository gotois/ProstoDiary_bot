const {
  createPool,
  sql,
  NotFoundError,
  DataIntegrityError,
  UniqueIntegrityConstraintViolationError,
} = require('slonik');
const { POSTGRES_CONNECTION_STRING } = require('../environment');
const pool = createPool(POSTGRES_CONNECTION_STRING);

// todo как показывает код - использую только pool, остальное нужно будет импортить напрямую из slonik
module.exports = {
  pool,
  sql,
  UniqueIntegrityConstraintViolationError,
  DataIntegrityError,
  NotFoundError,
};
