const bot = require('../core/bot');
const { pool, sql } = require('../core/database');

module.exports = async (request, response) => {
  if (request.body.message.text.length === 1) {
    response.sendStatus(400);
    return;
  }
  const passport = await pool.connect(async (connection) => {
    const passport = await connection.one(sql`
      SELECT id FROM passport WHERE telegram = ${request.body.message.from.id};
    `);
    return {
      id: passport.id,
    };
  });
  const body = {
    ...request.body,
    message: {
      ...request.body.message,
      gotois: passport, // расширяем встроенный TelegramMessage
    },
  };
  bot.processUpdate(body);
  response.sendStatus(200);
};
