const jose = require('jose');
const bot = require('../../../include/telegram-bot/bot');
const { pool } = require('../../../db/sql');
const assistantChatQueries = require('../../../db/selectors/chat');
const assistantBoQueries = require('../../../db/selectors/assistant');
const logger = require('../../../lib/log');
const notifyTelegram = require('../../../include/telegram-bot/services/notify-tg');
/**
 * @param {object} body - telegram native body
 * @returns {object}
 */
const getMessageFromBody = (body) => {
  let message;
  let type;
  if (body.message) {
    type = 'message';
    message = body.message;
  } else if (body.edited_message) {
    type = 'edited_message';
    message = body.edited_message;
  } else if (body.channel_post) {
    type = 'channel_post';
    message = body.channel_post;
  } else if (body.callback_query) {
    type = 'callback_query';
    message = body.callback_query.message;
  } else {
    throw new Error('Unknown telegram body');
  }

  const chatId = String(message.chat && message.chat.id);
  const userId = String(message.from && message.from.id);
  return {
    type,
    message,
    chatId,
    userId,
  };
};
/**
 * @description Расширяем встроенный объект telegram request message
 * @param {object} body - telegram request body
 * @returns {Promise<object|Error>}
 */
async function makeRequestBody(body) {
  const { message, type, chatId, userId } = getMessageFromBody(body);
  const { passports, assistants } = await pool.connect(async (connection) => {
    // сначала я получаю массив assistant_bot_id по чату
    // декодирую и передаю в passport - массив паспортов
    let results = [];
    try {
      results = await connection.many(
        assistantChatQueries.selectByChatId(chatId),
      );
      if (results.length === 0) {
        logger.warn('you need to connect this assistant');
        return {};
      }
    } catch (error) {
      logger.warn(error.message);
    }
    const passports = [];
    const assistants = [];
    if (body.channel_post) {
      logger.info('PUBLIC CHANNEL');
      return passports;
    }
    for (const result of results) {
      const assistantTable = await connection.one(
        assistantBoQueries.selectAssistantBotByEmail(result.bot_user_email),
      );
      const assistant = {
        private_key: assistantTable.private_key,
        public_key: assistantTable.public_key,
        id: assistantTable.id,
        token: assistantTable.token,
        clientId: result.client_id,
        name: result.client_id.split('@')[0],
      };
      assistants.push(assistant);
      // hack считаем что чаты начинающиеся с '-' являются публичными
      if (result.id.startsWith('-')) {
        logger.info('PUBLIC CHAT');
        passports.push({
          user: userId,
          email: result.bot_user_email,
        });
      } else {
        // fixme проверять срок через decoded.exp
        const decoded = jose.JWT.decode(result.token);
        passports.push({
          activated: decoded.email_verified,
          user: userId,
          passportId: decoded.sub, // ID паспорт бота
          email: decoded.email, // почта бота пользователя
        });
      }
    }
    return {
      passports,
      assistants,
    };
  });
  return {
    ...body,
    message: {
      ...message,
      type,
      passports,
      assistants,
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
        logger.error(error.stack);
      });
  }
  // webhook telegram message
  static async api(request, response) {
    logger.info('telegram api request');
    try {
      const body = await makeRequestBody(request.body);
      bot.processUpdate(body);
      response.sendStatus(200);
    } catch (error) {
      response.sendStatus(400);
    }
  }
};
