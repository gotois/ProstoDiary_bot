const Imap = require('imap');
const { simpleParser } = require('mailparser');
const crypt = require('./crypt.service');

class Vzor extends Imap {
  /**
   * @param {object} imapOptions - imap options
   * @param {?string} secretKey - secret shared key
   */
  constructor(imapOptions, secretKey) {
    super({
      ...imapOptions,
      host: 'imap.yandex.ru',
      port: 993,
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
   * @param {Array} search - imap search
   * @returns {Promise<Set<Mail>>}
   */
  async search(search) {
    await this.connect();
    try {
      const result = await new Promise((resolve, reject) => {
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
                await this.decryptAttachment(mail);
                mailSet.add(mail);
              }
            }
            resolve(mailSet);
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

  // todo функция валидации по имейлу пользователя и по привязанным ботам/ассистентам
  // async validateMail(mail) { ...

  /**
   * дешифровка
   *
   * @param {Mail} mail
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
   * Парсер возвращающий контент письма
   *
   * @param {number} uid
   * @returns {Promise<Mail>}
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

  fetch() {
    return this.search(['ALL']);
  }
}

module.exports = (imapOptions, secretKey) => {
  const vzor = new Vzor(imapOptions, secretKey);
  return vzor;
};
