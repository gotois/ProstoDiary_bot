const bot = require('../core/bot');
const { pool, sql, NotFoundError } = require('../core/database');

module.exports = async (request, response, next) => {
  if (request.body.message.text.length === 1) {
    response.sendStatus(400);
    return;
  }
  try {
    const gotoisCredentions = await pool.connect(async (connection) => {
      try {
        const passportTable = await connection.one(sql`
      SELECT id FROM passport WHERE telegram = ${request.body.message.from.id};
    `);
        const botTable = await connection.one(sql`
      SELECT email FROM bot WHERE passport_id = ${passportTable.id};
    `);
        return {
          id: passportTable.id,
          email: botTable.email,
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
