const jsonrpc = require('../core/jsonrpc');
const { pool } = require('../core/database');
const passportQueries = require('../db/passport');
const logger = require('../services/logger.service');

module.exports = async (request, response, next) => {
  logger.info(`RPC:${request.body.method}`);
  try {
    const gotoisCredentions = await pool.connect(async (connection) => {
      const botTable = await connection.maybeOne(
        passportQueries.selectBotByUserEmail(request.user),
      );
      const userTable = await connection.maybeOne(
        passportQueries.selectUserById(botTable.passport_id),
      );
      return {
        id: userTable.id, // todo rename userId
        userEmail: userTable.email,
      };
    });
    if (!gotoisCredentions) {
      return response.sendStatus(401).send('401 Unauthorized');
    }
    jsonrpc.server.call(
      request.body,
      {
        passport: gotoisCredentions,
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
