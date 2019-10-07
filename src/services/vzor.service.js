const notifier = require('mail-notifier');
const pkg = require('../../package.json');
const logger = require('./logger.service');
const { MAIL } = require('../environment');
const Attachment = require('../models/attachment');

const imap = {
  user: MAIL.USER,
  password: MAIL.PASSWORD,
  host: MAIL.HOST,
  port: MAIL.PORT,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  markSeen: false,
  search: ['ALL'], // todo: нужна функциональнось которая игнорирует те письма, которые уже были обработы ботом
};

class Vzor {
  constructor() {
    this.n = notifier(imap)
      .on('end', this.endNListener)
      .on('connected', this.connectedNListener)
      .on('error', this.errorNListener)
      .on('mail', this.mailListener);
  }
  errorNListener(message) {
    logger.error(message);
  }
  /**
   * @todo в случае если запускается через CRON - тогда не нужно использовать infinity loop
   * @returns {*}
   */
  endNListener() {
    // infinity loop
    return notifier.start();
  }
  /**
   * @param {Mail} mail - mail
   * @returns {Promise<undefined>}
   */
  async mailListener(mail) {
    const { from, headers, attachments } = mail;
    // todo: имя бота с которого пришло письмо
    //  это если письмо было отправлено ботом
    if (headers['x-bot']) {
      if (attachments) {
        for (const abstract of await Attachment.read(mail)) {
          abstract.telegram_user_id = headers['x-bot-telegram-user-id'];
          abstract.telegram_message_id = headers['x-bot-telegram-message-id'];
          abstract.email_message_id = mail.uid;
          abstract.publisher = pkg.publisher;
          abstract.creator = from;
          await abstract.save();
        }
      }
    } else {
      // const abstract = new Abstract();
      // todo нужно разбирать адреса и прочее самостоятельно через APIv2/text|document|photo
      //  но уже без отправки письма
      //  ...
      // await abstract.save();
    }
  }
  connectedNListener() {
    logger.info('connected email notifier');
  }
  startN() {
    // запускаем считыватель писем
    this.n.start();
  }
  stopN() {
    this.n.stop();
  }
  scanN() {
    this.n.scan();
  }
}

module.exports = Vzor;
