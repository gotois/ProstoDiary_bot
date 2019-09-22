const { Client, Pool } = require('pg');
const { IS_PRODUCTION, DATABASE } = require('../environment');
let connectionString;
/**
 * @see path отличается одним символом @
 */
if (IS_PRODUCTION) {
  connectionString = `postgres://${DATABASE.databaseUser}:${DATABASE.password}.${DATABASE.databaseHost}:${DATABASE.databasePort}/${DATABASE.databaseName}`;
} else {
  connectionString = `postgres://${DATABASE.databaseUser}:${DATABASE.password}@${DATABASE.databaseHost}:${DATABASE.databasePort}/${DATABASE.databaseName}`;
}
const client = new Client({ connectionString });
const pool = new Pool({ connectionString });
/**
 * @param {string} query - query
 * @param {Array|undefined} parameters - params
 * @returns {Promise}
 */
const $$ = (query, parameters = []) => {
  return new Promise((resolve, reject) => {
    if (!client._connected) {
      return reject('Database not connected!');
    }
    client.query(query, parameters, (error, result) => {
      if (error) {
        return reject(error);
      }
      switch (result.command) {
        case 'UPDATE': {
          if (!result.rowCount) {
            return reject('Update error');
          }
          return resolve(result);
        }
        default: {
          return resolve(result);
        }
      }
    });
  });
};

module.exports = {
  client,
  $$,
  pool,
};
