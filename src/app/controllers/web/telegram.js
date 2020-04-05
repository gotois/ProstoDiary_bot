const jose = require('jose');
const bot = require('../../../include/telegram-bot/bot');
const { pool } = require('../../../db/sql');
const assistantChatQueries = require('../../../db/selectors/chat');
const logger = require('../../../lib/log');
const notifyTelegram = require('../../../lib/notify-tg');
/**
 * @param {object} body - telegram request body
 * @returns {Promise<object>}
 */
async function makeRequestBody(body) {
  const message = body.message || body.callback_query.message;
  const passports = await pool.connect(async (connection) => {
    // сначала я получаю массив assistant_bot_id по чату
    // декодирую и передаю в passport - массив паспортов
    const results = await connection.many(
      assistantChatQueries.selectByChatId(String(message.chat.id)),
    );
    if (results.length === 0) {
      logger.warn('you need to connect this assistant');
      return {};
    }
    const passports = [];
    if (body.channel_post) {
      logger.info('PUBLIC CHANNEL');
      return passports;
    }
    for (const result of results) {
      // hack считаем что чаты начинающиеся с '-' являются публичными
      if (result.id.startsWith('-')) {
        logger.info('PUBLIC CHAT');
        passports.push({
          user: String(message.from.id),
          assistant: result.client_id,
          email: result.bot_user_email,
          jwt: result.token,
        });
      } else {
        // fixme проверять срок через decoded.exp
        const decoded = jose.JWT.decode(result.token);
        passports.push({
          activated: decoded.email_verified,
          user: String(message.from.id),
          assistant: result.client_id,
          passportId: decoded.sub, // ID паспорт бота
          email: decoded.email, // почта бота пользователя
          jwt: result.token,
        });
      }
    }
    return passports;
  });
  return {
    ...body,
    // расширяем встроенный объект telegram
    message: {
      ...message,
      passport: passports,
    },
  };
}

module.exports = class TelegramController {
  // not async specific for webhook
  static webhookAssistant(request, response) {
    response.status(200).send('OK');
    notifyTelegram(request.body)
      .then(() => {})
      .catch((error) => {
        logger.error(error);
      });
  }
  static async webhookAPI(request, response, next) {
    try {
      const body = await makeRequestBody(request.body);
      bot.processUpdate(body);
      response.sendStatus(200);
    } catch (error) {
      next(error);
    }
  }
};
