const bot = require('../core/bot');
const { pool } = require('../core/database');
const passportQueries = require('../db/passport');

module.exports = async (request, response, next) => {
  try {
    const gotoisCredentions = await pool.connect(async (connection) => {
      const userTable = await connection.maybeOne(
        passportQueries.selectIdByTelegramId(request.body.message.from.id),
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
      return {
        id: userTable.id, // todo rename userId
        botId: botTable.id,
        userEmail: userTable.email,
        botEmail: botTable.email,
        activated: botTable.activated,
      };
    });
    const body = {
      ...request.body,
      message: {
        ...request.body.message,
        // todo rename passport
        gotois: gotoisCredentions, // расширяем встроенный TelegramMessage
      },
    };
    bot.processUpdate(body);
    response.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
