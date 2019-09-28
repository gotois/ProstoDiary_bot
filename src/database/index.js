const { Client, Pool } = require('pg');
const { POSTGRES_CONNECTION_STRING } = require('../environment');
console.log('connectionString', POSTGRES_CONNECTION_STRING); // eslint-disable-line

const client = new Client({ connectionString: POSTGRES_CONNECTION_STRING });
const pool = new Pool({ connectionString: POSTGRES_CONNECTION_STRING });
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
