require('dotenv').config();
const notifier = require('mail-notifier');
const logger = require('./logger.service');
const { MAIL } = require('../environment');
const { unpack } = require('./archive.service');
const AbstractText = require('../models/abstract-text');
const AbstractPhoto = require('../models/abstract-photo');
const AbstractDocument = require('../models/abstract-document');
const Story = require('./story.service');

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

const mailListener = async (mail) => {
  const {
    html,
    text,
    headers,
    subject,
    from,
    to,
    date,
    receivedData,
    // messageId,
    // priority,
    // flags,
    attachments,
  } = mail;
  // console.log(mail); // eslint-disable-line

  // todo это если письмо было отправлено ботом. в противном случае нужно разбирать адреса и прочее самостоятельно
  if (from[0].address === 'no-reply@gotointeractive.com') {
    console.log('from bot');

    const botName = headers['x-bot']; // todo: название бота с которого пришло письмо. Может быть сторонним
    const botTelegramMessageId = headers['x-bot-telegram-message-id'];
    const botTelegramUserId = headers['x-bot-telegram-user-id'];

    if (attachments) {
      for (const attachment of attachments) {
        const {
          content,
          contentType,
          // generatedFileName,
          // contentId,
          // checksum,
          // length,
          // contentDisposition,
          // fileName,
          // transferEncoding,
        } = attachment;
        let abstract;
        switch (contentType) {
          case 'plain/text': {
            abstract = new AbstractText(content);
            break;
          }
          case 'image/png':
          case 'image/jpeg': {
            abstract = new AbstractPhoto(content);
            break;
          }
          case 'application/pdf':
          case 'application/xml': {
            abstract = new AbstractDocument(content);
            break;
          }
          case 'application/zip':
          case 'multipart/x-zip': {
            const zipContents = await unpack(content);
            for await (const [fileName, zipBuffer] of zipContents) {
              // fixme: здесь цикл
              abstract = new AbstractDocument(zipBuffer);
              // ...
            }
            break;
          }
          default: {
            throw new Error('Unknown mime type');
          }
        }

        await abstract.fill();
        const story = new Story(abstract, {
          date: date,
          telegram_user_id: botTelegramUserId,
          telegram_message_id: botTelegramMessageId,
        });
        //   await story.save();
      }
    }
  }
};

const errorListener = (message) => {
  logger.error(message);
};

// infinity loop
// TODO: в случае если запускается через CRON - тогда не нужно использовать infinity loop
const endListener = () => {
  return notifier.start();
};

const connectedListener = () => {
  logger.info('connected email notifier');
};

const n = notifier(imap)
  .on('end', endListener)
  .on('connected', connectedListener)
  .on('error', errorListener)
  .on('mail', mailListener);

module.exports = {
  start() {
    n.start();
  },
  stop() {
    n.stop();
  },
  scan() {
    n.scan();
  },
};
