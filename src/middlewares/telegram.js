const jose = require('jose');
const bot = require('../include/telegram-bot/bot');
const { pool } = require('../db/database');
const assistantQueries = require('../db/assistant');

module.exports = async (request, response, next) => {
  try {
    const message = request.body.message || request.body.callback_query.message;
    const gotoisCredentions = await pool.connect(async (connection) => {
      const assistantTable = await connection.maybeOne(
        assistantQueries.selectByUserId(String(message.from.id)),
      );

      if (!assistantTable) {
        return {};
      }

      const decoded = jose.JWT.decode(assistantTable.token);

      return {
        activated: decoded.email_verified, // fixme проверять на срок через decoded.exp
        user: String(message.from.id),
        passportId: decoded.sub, // ID паспорт бота
        assistant: decoded.aud, // ID ассистента
        email: decoded.email, // почта бота пользователя
        jwt: assistantTable.token,
      };
    });
    const body = {
      ...request.body,
      message: {
        ...message,
        passport: gotoisCredentions, // расширяем встроенный TelegramMessage
      },
    };
    bot.processUpdate(body);
    response.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
