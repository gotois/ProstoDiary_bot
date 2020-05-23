const { pool } = require('../../../db/sql');
const marketplaceQueries = require('../../../db/selectors/marketplace');
const { SERVER, IS_PRODUCTION } = require('../../../environment');

module.exports = async function () {
  try {
    const clients = await pool.connect(async (connection) => {
      const marketplaces = await connection.many(
        marketplaceQueries.selectAll(),
      );
      return marketplaces.map((assistant) => {
        let redirectUris = [];
        // насыщаем редиректами текущий урл сервера для дев
        if (!IS_PRODUCTION) {
          redirectUris.push(
            SERVER.HOST + `/oidcallback?client_id=${assistant.client_id}`,
          );
        }
        redirectUris = redirectUris.concat(assistant.redirect_uris);
        return {
          ...assistant,
          redirect_uris: redirectUris,
        };
      });
    });
    return Promise.resolve(clients);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
