const bot = require('../../core/bot');
const logger = require('../../services/logger.service');
const { mail } = require('../../lib/sendgrid');
/**
 * npm run e2e -- --match='API notify'
 *
 * https://github.com/gotois/ProstoDiary_bot/issues/343
 * Нотификация пользователю. Текст не читаем для бота.
 * в зависимости от доступных девайсов (телеграм, почта)
 *
 * @description аналогичны push-notification
 * @param {object} parameters - parameters
 * @param {object} passport - passport gotoisCredentions
 * @returns {Promise<*>}
 */
module.exports = async function(parameters, { passport }) {
  logger.info('notify');
  const { provider, subject, html, attachments = [] } = parameters;
  if (typeof subject !== 'string') {
    throw new TypeError('Subject is not a string');
  }
  if (provider.startsWith('tg')) {
    // telegram
    const messageHTML = `
        <b>${subject}</b>
        ${html}
      `;
    if (html.includes('<h')) {
      return Promise.reject(this.error(400, 'Unknown html tag for telegram'));
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
  } else if (provider.startsWith('mailto')) {
    // email
    const [mailResult] = await mail.send({
      from: passport.botEmail,
      to: passport.userEmail,
      subject,
      html,
      attachments,
      categories: ['notify'],
    });
    if (!mailResult.complete) {
      return Promise.reject(this.error(400, 'Mail send not completed'));
    }
  } else {
    return Promise.reject(this.error(400, 'Unknown provider'));
  }
};
