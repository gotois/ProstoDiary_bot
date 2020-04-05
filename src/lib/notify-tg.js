const bot = require('../include/telegram-bot/bot');
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
      disable_web_page_preview: true,
    });
  }
}

module.exports = notifyTelegram;