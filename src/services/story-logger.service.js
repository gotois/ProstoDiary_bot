const winston = require('winston');
const PsqlTransport = require('../db/transports/psql-transport');
const { SERVER } = require('../environment');
const logger = require('./logger.service');
const bot = require('../include/telegram-bot/bot');

const pqsqlTransport = new PsqlTransport();
pqsqlTransport.on('logged', async (info) => {
  logger.info('saveToDatabase:success');
  const telegramMessageId = info.message.object.mainEntity.find((entity) => {
    return entity.name === 'TelegramMessageId';
  })['value'];
  const telegramChatId = info.message.object.mainEntity.find((entity) => {
    return entity.name === 'TelegramChatId';
  })['value'];
  const isSilent = info.message.object.mainEntity.find((entity) => {
    return entity.name === 'silent';
  })['value'];
  if (isSilent) {
    logger.info('skip notify message');
    return;
  }
  await notifyTelegram({
    subject: 'Запись добавлена',
    html: 'Открыть запись',
    url: `${SERVER.HOST}/message/${info.messageId}`,
    parseMode: 'HTML',
    chatId: telegramChatId,
    messageId: telegramMessageId,
  });
});

const storyLogger = winston.createLogger({
  transports: [pqsqlTransport],
});

/**
 * @description Отправить документ телеграм ассистенту
 * @param {*} parameters - telegram parameters
 * @returns {Promise<undefined>}
 */
async function notifyTelegram(parameters) {
  const {
    subject,
    html = '',
    url,
    attachments = [],
    messageId,
    chatId,
    parseMode = 'HTML',
  } = parameters;
  const messageHTML = `
        <b>${subject}</b>
${html}
      `.trim();
  if (html.includes('<h')) {
    throw new Error('Unknown html tag for telegram');
  }
  // если есть attachments, тогда отдельно нужно посылать файлы в телегу
  if (attachments.length > 0) {
    for (const attachment of attachments) {
      await bot.sendDocument(
        chatId,
        Buffer.from(attachment.content),
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
    }
  } else if (messageId) {
    /* eslint-disable */
    const replyMarkup = !url
      ? null
      : {
        inline_keyboard: [
          [
            {
              text: html,
              url: url,
            },
          ],
        ],
      };
    /* eslint-enable */

    await bot.editMessageText(subject, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: parseMode,
      reply_markup: replyMarkup,
    });
  } else {
    await bot.sendMessage(chatId, messageHTML, {
      parse_mode: parseMode,
      disable_notification: true,
    });
  }
}

storyLogger.on('error', async (error) => {
  logger.error(error.message);

  await notifyTelegram({
    subject: error.message,
    chatId: error.chatId,
    messageId: error.messageId,
  });
});

module.exports = storyLogger;
