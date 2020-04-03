const template = require('../../views/assistants');
const { SERVER } = require('../../../environment');
const { pool } = require('../../../db/sql');
const assistantQueries = require('../../../db/assistant');

module.exports = class Marketplace {
  super() {
  }
  async assistants(request, response) {
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
      response.status(200).send(template({
        clients
      }));
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
};
