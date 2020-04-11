const template = require('../../views/assistants');
const { SERVER, MARKETPLACE } = require('../../../environment');
const { pool } = require('../../../db/sql');
const assistantQueries = require('../../../db/selectors/assistant');

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
        const { rows } = await connection.query(assistantQueries.selectAll());
        if (rows.length > 0) {
          response
            .status(400)
            .json({ error: 'Assistants exists. Please delete it if needs' });
          return;
        }
        await connection.query(assistantQueries.createAssistant(values));
      });
      response.status(200).json(values);
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  static async assistants(request, response) {
    try {
      const clients = await pool.connect(async (connection) => {
        const allAssistants = await connection.many(
          assistantQueries.selectAll(),
        );
        return allAssistants.map((assistant) => {
          return {
            ...assistant,
            redirect_uris: [
              // насыщаем редирект текущим урлом сервера
              SERVER.HOST + `/oidcallback?client_id=${assistant.client_id}`,
              ...assistant.redirect_uris,
            ],
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
