const logger = require('../../services/logger.service');
const bot = require('../../include/telegram-bot/bot');

async function notifyTelegram(parameters) {
  const { subject, html, attachments = [] } = parameters;
  const messageHTML = `
        <b>${subject}</b>
        ${html}
      `;
  if (html.includes('<h')) {
    throw new Error('Unknown html tag for telegram');
  }
  const chatId = -1; // fixme chat.id берется из паспорта пользователя passport.telegram_chat_id
  // если есть attachments, тогда отдельно нужно посылать файлы в телегу
  if (attachments.length > 0) {
    for (const attachment of attachments) {
      await bot.sendDocument(
        chatId,
        Buffer.from(attachment.content),
        {
          caption: subject,
          parse_mode: 'HTML',
          disable_notification: true,
        },
        {
          filename: attachment.filename,
          contentType: attachment.type,
        },
      );
    }
  } else {
    await bot.sendMessage(chatId, messageHTML, {
      parse_mode: 'HTML',
      disable_notification: true,
    });
  }
}

module.exports = async function(parameters, { passport }) {
  logger.info('notify.tg');
  await notifyTelegram(parameters, passport);
}