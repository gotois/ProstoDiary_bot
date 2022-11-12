const jose = require('jose');
const e = require('express');
const bot = require('../../../include/telegram-bot/bot');
const { pool } = require('../../../db/sql');
const assistantChatQueries = require('../../../db/selectors/chat');
const assistantBoQueries = require('../../../db/selectors/assistant');
const logger = require('../../../lib/log');
/**
 * @param {object} body - telegram native body
 * @returns {object|Error}
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
 * @param {object} root - telegram request body
 * @param {any} root.chatId - chat id
 * @param {any} root.userId - user_id
 * @returns {Promise<object|Error>}
 */
async function makeRequestBody({ chatId, userId }) {
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
    passports,
    assistants,
  };
}

module.exports = class TelegramController {
  /**
   * @param {object} parameters - telegram object response
   * @param {string} parameters.subject - subject text
   * @param {string} parameters.messageId - message id
   * @param {string} parameters.chatId - chat id
   * @param {string} parameters.html - html text
   * @param {string} parameters.parseMode - parse mode html or markdown
   * @param {string} [parameters.url] - url
   * @param {Array} [parameters.attachments] - file attachments
   * @returns {Promise<Array>} - bot promise
   */
  static notifyTelegram(parameters) {
    const {
      subject,
      url,
      messageId,
      chatId,
      html,
      parseMode,
      attachments = [],
    } = parameters;
    // если есть attachments, отдельно посылаю каждый файл через массив промисов
    if (attachments.length > 0) {
      return Promise.all(
        attachments.map((attachment) => {
          return bot.sendDocument(
            chatId,
            Buffer.from(attachment.content, 'base64'),
            {
              caption: subject,
              parse_mode: parseMode,
              disable_notification: true,
            },
            {
              filename: attachment.filename,
              contentType: attachment.type,
            },
          );
        }),
      );
    } else if (messageId && url) {
      return bot.sendMessage(chatId, subject, {
        parse_mode: parseMode,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: html,
                url: url,
              },
            ],
          ],
        },
      });
    } else if (url) {
      return bot.editMessageText(subject, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: parseMode,
        reply_markup: null,
      });
    } else {
      return bot.sendMessage(chatId, html, {
        parse_mode: parseMode,
        chat_id: chatId,
        disable_notification: true,
        disable_web_page_preview: true,
      });
    }
  }
  /**
   * @param {jsonldAction} document - jsonld
   * @returns {object}
   */
  static convertJsonLdToTelegramObject(document) {
    const telegramMessageId = document.mainEntity.find((entity) => {
      return entity.name === 'TelegramMessageId';
    });
    const messageId = telegramMessageId && telegramMessageId['value'];
    const telegramChatId = document.mainEntity.find((entity) => {
      return entity.name === 'TelegramChatId';
    });
    const chatId = telegramChatId && telegramChatId['value'];
    if (!document.result) {
      return {
        chatId,
        messageId,
      };
    }
    let subject = document.result.abstract;
    const url = document.result.url;
    const attachments = [];
    let html;
    let parseMode;

    switch (document.result.encodingFormat) {
      case 'text/markdown': {
        parseMode = 'Markdown';
        html = `${subject}`;
        if (document.result.text) {
          html += `\n${document.result.text}`;
        }
        break;
      }
      default: {
        parseMode = 'HTML';
        if (url) {
          html = `${subject}`;
        } else {
          html = `<b>${subject}</b>`;
          if (document.result.text) {
            html += document.result.text;
          }
        }
        if (html.includes('<h')) {
          throw new Error('Unknown html tag for telegram');
        }
        break;
      }
    }
    if (document.result.messageAttachment) {
      attachments.push({
        content: document.result.messageAttachment.abstract,
        filename: document.result.messageAttachment.name,
        type: document.result.messageAttachment.encodingFormat,
      });
      subject = document.result.about.name;
    }
    return {
      subject,
      parseMode,
      html: html.trim(),
      url,
      chatId,
      messageId,
      attachments,
    };
  }
  static notifyProcessing(request, response) {
    response.status(202).send();
    logger.info('processing');
    const tgObjectResponse = TelegramController.convertJsonLdToTelegramObject(
      request.body,
    );
    logger.info(JSON.stringify(tgObjectResponse));
  }
  static notifyError(request, response) {
    response.status(202).send();
    logger.warn('notify error');
    const tgObjectResponse = TelegramController.convertJsonLdToTelegramObject(
      request.body,
    );
    TelegramController.notifyTelegram(tgObjectResponse)
      .then(() => {})
      .catch((error) => {
        logger.error(error.stack);
      });
  }
  /**
   * @description Отправить нотификацию телеграм ассистенту с вебхукой
   * @param {e.Request} request - request
   * @param {e.Response} response - response
   */
  static notify(request, response) {
    response.status(202).send();
    const tgObjectResponse = TelegramController.convertJsonLdToTelegramObject(
      request.body,
    );
    TelegramController.notifyTelegram(tgObjectResponse)
      .then(() => {})
      .catch((error) => {
        logger.error(error.stack);
      });
  }
  /**
   * @description webhook telegram message
   * @param {e.Request} request - request
   * @param {e.Response} response - response
   * @returns {Promise<void>}
   */
  static async api(request, response) {
    logger.info('telegram api request');
    try {
      const { message, type, chatId, userId } = getMessageFromBody(
        request.body,
      );
      // специальная упрощенная логика для публичных каналов
      if (request.body.channel_post) {
        logger.info('PUBLIC CHANNEL');
        // Расширяем встроенный объект telegram request message
        bot.processUpdate({
          ...request.body,
          message: {
            ...message,
            type,
          },
        });
      } else {
        const { passports, assistants } = await makeRequestBody({
          chatId,
          userId,
        });
        // Расширяем встроенный объект telegram request message
        bot.processUpdate({
          ...request.body,
          message: {
            ...message,
            type,
            passports,
            assistants,
          },
        });
      }
      response.sendStatus(200);
    } catch {
      response.sendStatus(400);
    }
  }
};
