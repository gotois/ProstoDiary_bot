const jsonrpc = require('../core/jsonrpc');
const { pool } = require('../core/database');
const passportQueries = require('../db/passport');

module.exports = async (request, response, next) => {
  try {
    const bot = await pool.connect(async (connection) => {
      const data = await connection.maybeOne(
        passportQueries.selectBotByUserEmail(
          request.user + '@gotointeractive.com',
        ),
      );
      return data;
    });
    if (!bot) {
      return response.sendStatus(401).send('401 Unauthorized');
    }
    jsonrpc.server.call(
      request.body,
      {
        gotois: {
          id: bot.passport_id,
        },
      },
      (error, result) => {
        if (error) {
          return response.status(500).json(error);
        }
        return response.send(result);
      },
    );
  } catch (error) {
    next(error);
  }
};
