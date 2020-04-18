const bot = require('../bot');
/**
 * @description Отправить документ телеграм ассистенту
 * @param {object} parameters - telegram parameters
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
  let messageHTML = '';
  if (parseMode === 'HTML') {
    messageHTML = `
        <b>${subject}</b>
${html}
      `.trim();
    if (html.includes('<h')) {
      throw new Error('Unknown html tag for telegram');
    }
  } else {
    messageHTML = `${subject}${html}`;
  }
  // если есть attachments, отдельно посылаю каждый файл
  if (attachments.length > 0) {
    for (const attachment of attachments) {
      await bot.sendDocument(
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

    try {
      await bot.editMessageText(subject, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: parseMode,
        reply_markup: replyMarkup,
      });
    } catch (error) {
      const body = error.toJSON();
      // todo костыль для forward message
      if (body.message.endsWith('t be edited')) {
        await bot.sendMessage(chatId, subject, {
          chat_id: chatId,
          parse_mode: parseMode,
          reply_markup: replyMarkup,
        });
        return;
      }
      throw error;
    }
  } else {
    await bot.sendMessage(chatId, messageHTML, {
      parse_mode: parseMode,
      disable_notification: true,
      disable_web_page_preview: true,
    });
  }
}

module.exports = notifyTelegram;
