require('dotenv').config();
const notifier = require('mail-notifier');
const logger = require('./logger.service');
const { MAIL } = require('../environment');

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

const mailListener = (mail) => {
  const {
    html,
    text,
    headers,
    subject,
    messageId,
    priority,
    from,
    to,
    date,
    receivedData,
    flags,
    attachments,
  } = mail;
  if (attachments) {
    for (const attachment of attachments) {
      const {
        contentDisposition,
        fileName,
        transferEncoding,
        contentType,
        generatedFileName,
        contentId,
        checksum,
        length,
        content,
      } = attachment;
      // console.log(content);
    }
  }
  console.log(mail); // eslint-disable-line
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
