const Imap = require('imap');
const { MailParser } = require('mailparser');
const crypt = require('./crypt.service');

/**
 * @param {object} imapOptions - imap options
 * @param {Array} search - imap search
 * @returns {Promise<Map<Mail>>}
 */
const search = (imapOptions, search) => {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      ...imapOptions,
      host: 'imap.yandex.ru',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: true },
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
};

/**
 * @param {Mail} mail - mail
 * @param {?string} secretKey - secret key
 * @returns {Promise<Array<{subject: string, body: *, contentType: string}>>}
 */
const read = async (mail, secretKey) => {
  const output = [];
  // Валидация письма
  if (mail.headers['x-bot'] || mail.from[0].address === 'xxx@ya.ru') {
    if (mail.attachments) {
      for (const attachment of mail.attachments) {
        if (
          secretKey &&
          (attachment.transferEncoding === 'base64' ||
            attachment.transferEncoding === 'quoted-printable')
        ) {
          const decryptMessage = await crypt.openpgpDecrypt(
            attachment.content,
            [secretKey],
          );
          output.push({
            body: decryptMessage,
            contentType: attachment.contentType,
          });
        } else {
          output.push({
            body: attachment.content,
            contentType: attachment.contentType,
          });
        }
      }
    } else {
      output.push({
        body: mail.html,
        contentType: mail.headers['content-type'],
      });
    }
  } else {
    // todo Иначе сразу удаляем
    //  ...
    throw new Error('Сообщение пользователя успешно удалено и помечено в спам');
  }
  return output;
};

module.exports = {
  search,
  read,
};
