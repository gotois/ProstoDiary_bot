const {
  createPool,
  sql,
  NotFoundError,
  DataIntegrityError,
  UniqueIntegrityConstraintViolationError,
} = require('slonik');
const { POSTGRES_CONNECTION_STRING } = require('../environment');
const pool = createPool(POSTGRES_CONNECTION_STRING);

module.exports = {
  pool,
  sql,
  UniqueIntegrityConstraintViolationError,
  DataIntegrityError,
  NotFoundError,
};
