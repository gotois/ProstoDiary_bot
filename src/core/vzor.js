const notifier = require('mail-notifier');
const { MailParser } = require('mailparser');
const Imap = require('imap');
const { IS_CRON, IS_PRODUCTION } = require('../environment');
const logger = require('../services/logger.service');
const mailService = require('../services/mail.service');

class Vzor {
  /**
   * @todo нужна функциональнось которая игнорирует те письма, которые уже были обработы ботом
   * @example search = ['ALL', ['UID', 2657]]; // search by uid
   *
   * @param {*} imapOptions - imap options
   */
  constructor(imapOptions) {
    // imapOptions = {
    //   ...imapOptions,
    //   search: ['ALL', ['UID', 2657]]
    // };

    this.n = notifier(
      {
        ...imapOptions,
        tls: true,
        markSeen: true,
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
      .on('mail', mailService.read)
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
  /**
   * @param {Map} mailMap - mail map
   */
  static async readEmail(mailMap) {
    for (const [_mapId, mail] of mailMap) {
      await mailService.read(mail);
    }
  }
  /**
   * @param {object} imapOptions - imap options
   * @param {Array} search - imap search
   * @returns {Promise<Map>}
   */
  static search(imapOptions, search) {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        ...imapOptions,
        host: 'imap.yandex.ru',
        port: 993,
        tls: true,
      });
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
      imap.once('error', (error) => {
        reject(error);
      });
      imap.connect();
    });
  }
}

module.exports = Vzor;
