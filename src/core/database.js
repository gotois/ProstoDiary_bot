const { createPool, sql, NotFoundError } = require('slonik');
const { POSTGRES_CONNECTION_STRING } = require('../environment');
const pool = createPool(POSTGRES_CONNECTION_STRING);

module.exports = {
  pool,
  sql,
  NotFoundError,
};
