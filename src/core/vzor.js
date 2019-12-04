const notifier = require('mail-notifier');
const { client } = require('./jsonrpc');
const { IS_CRON, IS_PRODUCTION } = require('../environment');
const logger = require('../services/logger.service');
const imapService = require('../services/imap.service');

class Vzor {
  /**
   * @todo нужна функциональнось которая игнорирует те письма, которые уже были обработы ботом
   * @param {object} imapOptions - imap options
   */
  constructor(imapOptions) {
    this.n = notifier(
      {
        ...imapOptions,
        tls: true,
        markSeen: false,
        tlsOptions: { rejectUnauthorized: false },
        box: 'INBOX',
      },
      (debugMessage) => {
        if (!IS_PRODUCTION) {
          logger.log('info', debugMessage);
        }
      },
    )
      .on('connected', this.connectedNListener)
      .on('error', this.errorNListener)
      .on('mail', async (mail) => {
        const messages = await imapService.read(mail);
        for (const { subject, body, contentType } of messages) {
          const { error, result } = await client.request('story', {
            subject,
            body,
            contentType,
            uid: mail.uid,
          });
          logger.info('result', result)
          if (error) {
            throw new Error(error);
          }
        }
      })
      .on('end', this.endNListener);
  }
  /**
   * запускаем считыватель писем
   */
  listen() {
    this.n.start();
  }
  stopListen() {
    this.n.stop();
  }
  errorNListener(message) {
    logger.error(message);
  }
  /**
   * @returns {*}
   */
  endNListener() {
    // в случае если запускается через CRON - тогда не используем infinity loop
    if (IS_CRON) {
      this.stopListen();
    } else {
      return this.n.start();
    }
  }
  connectedNListener() {
    logger.info('connected email notifier');
  }
}

module.exports = Vzor;
