const jsonrpc = require('../core/jsonrpc');
const { pool } = require('../core/database');
const passportQueries = require('../db/passport');
const logger = require('../services/logger.service');

module.exports = async (request, response, next) => {
  logger.info(`RPC:${request.body.method}`);
  let passport;
  try {
    passport = await pool.connect(async (connection) => {
      const userTable = await connection.maybeOne(
        passportQueries.selectUserByEmail(request.user),
      );
      if (!userTable) {
        return {};
      }
      const botTable = await connection.maybeOne(
        passportQueries.selectByPassport(userTable.id),
      );
      if (!botTable) {
        return {};
      }
      return botTable;
    });
  } catch (error) {
    logger.error(error);
    return response.status(500).json('Bad error :/');
  }
  if (!passport) {
    return response.sendStatus(401).send('401 Unauthorized');
  }
  try {
    const result = await jsonrpc.rpcRequest(
      request.body.method,
      request.body.params,
      passport,
    );
    return response.send(result);
  } catch (error) {
    next(error);
  }
};
