require('dotenv').config();
const notifier = require('mail-notifier');
const logger = require('../services/logger.service');
const { MAIL } = require('../environment');
const { unpack } = require('../services/archive.service');
const AbstractText = require('../models/abstract/abstract-text');
const AbstractPhoto = require('../models/abstract/abstract-photo');
const AbstractDocument = require('../models/abstract/abstract-document');
const UserStory = require('../models/story/user-story');

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
/**
 * @param {object} mail - mail
 * @param {Array} mail.attachments - email attachments
 * @returns {Promise<Array>}
 */
const readAttachments = async ({ attachments, from }) => {
  const publisher = from[0].addresses;
  const abstracts = [];
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
        abstracts.push(new AbstractText(content, publisher));
        break;
      }
      // todo: add content video
      // case 'video': {
      //   break;
      // }
      case 'image/png':
      case 'image/jpeg': {
        abstracts.push(new AbstractPhoto(content, publisher));
        break;
      }
      case 'application/pdf':
      case 'application/xml': {
        abstracts.push(new AbstractDocument(content, publisher));
        break;
      }
      case 'application/zip':
      case 'multipart/x-zip': {
        for await (const [fileName, zipBuffer] of unpack(content)) {
          abstracts.push(new AbstractDocument(zipBuffer, publisher));
        }
        break;
      }
      default: {
        // todo: тогда нужен разбора html и text самостоятельно из письма
        throw new Error('Unknown mime type');
      }
    }
  }
  for (const a of abstracts) {
    await a.fill();
  }
  return abstracts;
};

/**
 * @param {object} mail - mail
 * @param {any} mail.html - html
 * @param {any} mail.attachments - attachments
 * @param {any} mail.text - text
 * @param {any} mail.subject - subject
 * @param {any} mail.to - to
 * @param {any} mail.receivedData - receivedData
 * @param {any} mail.messageId - messageId
 * @param {any} mail.priority - priority
 * @param {any} mail.flags - flags
 * @param {any} mail.receivedData - receivedData
 * @returns {Promise<undefined>}
 */
const mailListener = async (mail) => {
  const { headers, from, date, attachments } = mail;
  // console.log(mail); // eslint-disable-line

  // todo это если письмо было отправлено ботом.
  if (from[0].address === 'no-reply@gotointeractive.com') {
    // console.log('from bot');

    const botName = headers['x-bot']; // todo: название бота с которого пришло письмо. Может быть сторонним
    const botTelegramMessageId = headers['x-bot-telegram-message-id'];
    const botTelegramUserId = headers['x-bot-telegram-user-id'];
    if (attachments) {
      for await (const abstract of readAttachments(mail)) {
        const story = new UserStory(abstract, {
          date: date,
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
