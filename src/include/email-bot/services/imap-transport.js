const Imap = require('imap');
const { simpleParser } = require('mailparser');
const environment = require('../environment.json');
const crypt = require('../../../services/crypt.service');
// const tfa = require('./2fa.service');

module.exports = class Vzor extends Imap {
  /**
   * @param {object} imapOptions - imap options
   * @param {?string} secretKey - secret shared key
   */
  constructor(imapOptions, secretKey) {
    super({
      ...imapOptions,
      host: environment.imap.host,
      port: environment.imap.port,
      tls: true,
      markSeen: false,
      tlsOptions: { rejectUnauthorized: true },
    });
    this.secretKey = secretKey;
  }
  connect() {
    return new Promise((resolve, reject) => {
      this.once('ready', () => {
        resolve();
      });
      this.once('error', (error) => {
        reject(error);
      });
      super.connect();
    });
  }
  close() {
    return new Promise((resolve, reject) => {
      if (!this._box) {
        resolve();
        return;
      }
      this.closeBox((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
  /**
   * @description Удаление письма ящика
   * @param {string} uid - uid message
   * @returns {Promise<*>}
   */
  async remove(uid) {
    await this.connect();
    try {
      const result = await new Promise((resolve, reject) => {
        this.openBox('INBOX', false, (error) => {
          if (error) {
            reject(error);
            return;
          }
          this.addFlags(uid, 'Deleted', (error) => {
            if (error) {
              reject(error);
              return;
            }
            resolve();
          });
        });
      });
      return result;
      // eslint-disable-next-line no-useless-catch
    } catch (error) {
      throw error;
    } finally {
      await this.close();
      this.end();
    }
  }
  /**
   * @description imap search
   * @param {Array} search - imap search
   * @returns {Promise<Set<object>>}
   */
  async search(search) {
    await this.connect();
    try {
      return await new Promise((resolve, reject) => {
        this.openBox('INBOX', true, () => {
          super.search(search, async (error, results) => {
            if (error) {
              reject(error);
              return;
            }
            const mailSet = new Set();
            if (results.length > 0) {
              for (const mailResult of results) {
                const mail = await this.parser(mailResult);
                // todo валидация сообщения
                // await this.validateEmail(mail.headerLines);
                await this.decryptAttachment(mail);
                mail.headers = Object.fromEntries([...mail.headers]);
                delete mail.headerLines;
                mailSet.add(mail);
              }
            }
            resolve(mailSet);
          });
        });
      });
      // eslint-disable-next-line no-useless-catch
    } catch (error) {
      throw error;
    } finally {
      await this.close();
      this.end();
    }
  }

  // todo валидация полученного сообщения от привязанных к боту ассистентам
  // @see https://github.com/gotois/ProstoDiary_bot/issues/346
  // validateEmail(mail, secret) {
  //   const time = mail.date
  //   return tfa.verifyBot(secret, token, 1453667720);
  // }

  /**
   * @description дешифровка
   * @param {object} mail - email
   * @returns {Promise<void>}
   */
  async decryptAttachment(mail) {
    if (mail.headers.has('x-bot')) {
      if (mail.attachments) {
        let index = 0;
        for (const attachment of mail.attachments) {
          if (
            this.secretKey &&
            ['quoted-printable', 'base64'].includes(
              attachment.headers.get('content-transfer-encoding'),
            )
          ) {
            const decryptMessage = await crypt.openpgpDecrypt(
              attachment.content,
              [this.secretKey],
            );
            mail.attachments[index].content = decryptMessage;
          }
          index++;
        }
      }
    }
  }
  /**
   * @description Парсер возвращающий контент письма
   * @param {number} uid - mail uid
   * @returns {Promise<object>} - Mail
   */
  parser(uid) {
    return new Promise((resolve, reject) => {
      const f = super.fetch(uid, { bodies: '', struct: true });
      f.on('message', (message) => {
        let attributes;
        message.once('attributes', (attribute) => {
          attributes = attribute;
        });
        message.on('body', (stream) => {
          simpleParser(stream, (error, mail) => {
            if (error) {
              reject(error);
              return;
            }
            resolve({
              ...attributes,
              ...mail,
            });
          });
        });
      });
      f.once('error', (error) => {
        reject(error);
      });
    });
  }
  /**
   * @description imap-fetch
   * @returns {Promise<Set<object>>}
   */
  fetch() {
    return this.search(['ALL']);
  }
};
