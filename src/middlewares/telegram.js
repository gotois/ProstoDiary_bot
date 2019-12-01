const bot = require('../core/bot');
const { pool } = require('../core/database');
const passportQueries = require('../db/passport');
const botQueries = require('../db/bot');

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
        botQueries.selectByPassport(passportTable.id),
      );
      if (!botTable) {
        return {};
      }
      return {
        id: passportTable.id,
        email: botTable.email,
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
