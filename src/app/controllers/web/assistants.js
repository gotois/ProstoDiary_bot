const template = require('../../views/assistants');
const { SERVER, IS_PRODUCTION, MARKETPLACE } = require('../../../environment');
const { pool } = require('../../../db/sql');
const marketplaceQueries = require('../../../db/selectors/marketplace');

module.exports = class Marketplace {
  super() {}
  /**
   * @description Обновление таблицы ассистентов из env
   * @param {*} request - request
   * @param {*} response - response
   * @returns {Promise<void>}
   */
  static async refresh(request, response) {
    try {
      const values = MARKETPLACE.ASSISTANTS;
      await pool.connect(async (connection) => {
        const { rows } = await connection.query(marketplaceQueries.selectAll());
        if (rows.length > 0) {
          response
            .status(400)
            .json({ error: 'Assistants exists. Please delete it if needs' });
          return;
        }
        await connection.query(marketplaceQueries.createAssistant(values));
      });
      response.status(200).json(values);
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  static async one(request, response) {
    try {
      const client = await pool.connect(async (connection) => {
        const marketplace = await connection.one(
          marketplaceQueries.selectByClientId(request.params.id),
        );
        return marketplace;
      });
      response.status(200).json(client);
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  static async assistants(request, response) {
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
      response.status(200).send(
        template({
          clients,
        }),
      );
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
};
