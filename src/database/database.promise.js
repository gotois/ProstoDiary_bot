const client = require('./database.client.js');
/**
 *
 * @param {string} query - query
 * @param {Array|undefined} params - params
 * @returns {Promise}
 */
module.exports = (query, params = []) => {
  return new Promise((resolve, reject) => {
    client.query(query, params, (error, result) => {
      if (error) {
        return reject(error);
      }
      // Check available updating
      switch (result.command) {
        case 'UPDATE': {
          if (!result.rowCount) {
            return reject('Update error');
          }
          break;
        }
      }
      resolve(result);
    });
  });
};
