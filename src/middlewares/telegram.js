const bot = require('../core/bot');
const { pool } = require('../core/database');
const passportQueries = require('../db/passport');

module.exports = async (request, response, next) => {
  try {
    const gotoisCredentions = await pool.connect(async (connection) => {
      const passportTable = await connection.maybeOne(
        passportQueries.selectIdByTelegramId(request.body.message.from.id),
      );
      if (!passportTable) {
        return {};
      }
      const botTable = await connection.maybeOne(
        passportQueries.selectByPassport(passportTable.id),
      );
      if (!botTable) {
        return {};
      }
      return {
        id: passportTable.id, // todo rename userId
        botId: botTable.id,
        userEmail: passportTable.email,
        botEmail: botTable.email,
        activated: botTable.activated,
      };
    });
    const body = {
      ...request.body,
      message: {
        ...request.body.message,
        gotois: gotoisCredentions, // расширяем встроенный TelegramMessage
      },
    };
    bot.processUpdate(body);
    response.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
