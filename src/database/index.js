const { Client } = require('pg');
const { IS_PRODUCTION, DATABASE } = require('../environment');
/**
 * @see path отличается одним символом @
 */
const databaseClient = (() => {
  if (IS_PRODUCTION) {
    return new Client(
      `postgres://${DATABASE.databaseUser}:${DATABASE.password}.${DATABASE.databaseHost}:${DATABASE.databasePort}/${DATABASE.databaseName}`,
    );
  }
  return new Client(
    `postgres://${DATABASE.databaseUser}:${DATABASE.password}@${DATABASE.databaseHost}:${DATABASE.databasePort}/${DATABASE.databaseName}`,
  );
})();
/**
 * @param {string} query - query
 * @param {Array|undefined} params - params
 * @returns {Promise}
 */
const $$ = (query, params = []) => {
  return new Promise((resolve, reject) => {
    if (!databaseClient._connected) {
      return reject('Database not connected!');
    }
    databaseClient.query(query, params, (error, result) => {
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
  client: databaseClient, // TODO: rename
  $$,
};
