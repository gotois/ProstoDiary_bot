const notifier = require('mail-notifier');
const Imap = require('imap');
const { MailParser } = require('mailparser');
const logger = require('./logger.service');
const { MAIL, IS_CRON, IS_PRODUCTION } = require('../environment');
const mailService = require('./mail.service');

const imapOptions = {
  host: MAIL.HOST,
  port: MAIL.PORT,
  user: MAIL.USER,
  password: MAIL.PASSWORD,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
  box: 'INBOX',
};

class Vzor {
  /**
   * @todo нужна функциональнось которая игнорирует те письма, которые уже были обработы ботом
   * @example search = ['ALL', ['UID', 2657]]; // search by uid
   * @param {*} search - search param
   */
  constructor(search = ['ALL']) {
    this.n = notifier(
      { ...imapOptions, markSeen: false, search },
      (debugMessage) => {
        if (!IS_PRODUCTION) {
          logger.log('info', debugMessage);
        }
      },
    )
      .on('connected', this.connectedNListener)
      .on('error', this.errorNListener)
      .on('mail', mailService.read)
      .on('end', this.endNListener);
    this.n.start(); // запускаем считыватель писем
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
      this.n.stop();
    } else {
      return this.n.start();
    }
  }
  connectedNListener() {
    logger.info('connected email notifier');
  }
  /**
   * @param {Array} search - imap search
   * @returns {Promise<Map>}
   */
  static search(search) {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        ...imapOptions,
        markSeen: true,
      });
      imap.connect();
      imap.once('ready', () => {
        imap.openBox('INBOX', true, () => {
          imap.search(search, (error, results) => {
            if (error) {
              reject(error);
              return;
            }
            const mailMap = new Map();
            if (results.length === 0) {
              imap.end();
              resolve(mailMap);
              return mailMap;
            }
            const f = imap.fetch(results, { bodies: '' });
            f.on('message', (message) => {
              let uid;
              let flags;
              message.on('attributes', (attributes) => {
                uid = attributes.uid;
                flags = attributes.flags;
              });
              const mp = new MailParser();
              mp.once('end', (mail) => {
                mail.uid = uid;
                mail.flags = flags;
                mailMap.set(uid, mail);
              });
              message.once('body', (stream) => {
                stream.pipe(mp);
              });
            });
            f.once('error', (error) => {
              imap.end();
              reject(error);
            });
            f.once('end', () => {
              imap.end();
              resolve(mailMap);
            });
          });
        });
      });
    });
  }
}

module.exports = Vzor;
