const bot = require('../core/bot');
const { pool, NotFoundError } = require('../core/database');
const passportQueries = require('../db/passport');
const botQueries = require('../db/bot');

module.exports = async (request, response, next) => {
  if (request.body.message.text.length === 1) {
    response.sendStatus(400);
    return;
  }
  try {
    const gotoisCredentions = await pool.connect(async (connection) => {
      try {
        const passportTable = await connection.one(
          passportQueries.selectIdByTelegramId(request.body.message.from.id),
        );
        const botTable = await connection.one(
          botQueries.selectByPassport(passportTable.id),
        );
        return {
          id: passportTable.id,
          email: botTable.email,
          activated: botTable.activated,
        };
      } catch (error) {
        if (error instanceof NotFoundError) {
          return {};
        }
        throw error;
      }
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
