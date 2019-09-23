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

const readAttachments = async (attachments) => {
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
    switch (contentType) {
      case 'plain/text': {
        return [new AbstractText(content)];
      }
      // todo: add content video
      // case 'video': {
      //   break;
      // }
      case 'image/png':
      case 'image/jpeg': {
        return [new AbstractPhoto(content)];
      }
      case 'application/pdf':
      case 'application/xml': {
        return [new AbstractDocument(content)];
      }
      case 'application/zip':
      case 'multipart/x-zip': {
        const out = [];
        for await (const [fileName, zipBuffer] of unpack(content)) {
          out.push(new AbstractDocument(zipBuffer));
        }
        return out;
      }
      default: {
        // todo: тогда нужен разбора html и text самостоятельно из письма
        throw new Error('Unknown mime type');
      }
    }
  }
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

  // todo это если письмо было отправлено ботом.
  if (from[0].address === 'no-reply@gotointeractive.com') {
    // console.log('from bot');

    const botName = headers['x-bot']; // todo: название бота с которого пришло письмо. Может быть сторонним
    const botTelegramMessageId = headers['x-bot-telegram-message-id'];
    const botTelegramUserId = headers['x-bot-telegram-user-id'];
    if (attachments) {
      for (const abstract of readAttachments(attachments)) {
        await abstract.fill();
        const story = new Story(abstract, {
          date: date,
          publisher: from[0].addresses,
          telegram_user_id: botTelegramUserId,
          telegram_message_id: botTelegramMessageId,
        });
        // xxx
        await story.save();
      }
    }
  } else {
    // todo нужно разбирать адреса и прочее самостоятельно
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
