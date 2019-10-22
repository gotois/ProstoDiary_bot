const pkg = require('../../package');
const { IS_AVA_OR_CI } = require('../environment');
const sgMail = require('../services/sendgridmail.service');
const Attachment = require('../models/attachment');
const jsonldModel = require('../models/jsonld');
/**
 * @description весь pipe работы с input - вставка и разбор логики voice, text, photo, document
 * @param {RequestObject} requestObject - requestObject
 * @returns {object|Error}
 */
const post = async (requestObject) => {
  const {
    buffer,
    mime,
    publisher,
    creator,
    date,
    caption = null, // eslint-disable-line
    telegram_message_id = null,
  } = requestObject.params;
  const { email } = await jsonldModel.load(creator);
  // получаем ввод, переводим его в текстовый формат или буфер (raw)
  const attachment = await Attachment.create(buffer, mime);
  const headers = {
    'x-bot': pkg.name,
    'x-bot-creator': email,
  };
  if (IS_AVA_OR_CI) {
    headers['x-bot-testing'] = process.env.NODE_ENV;
  }
  if (telegram_message_id) {
    headers['x-bot-telegram-message-id'] = String(telegram_message_id);
  }
  const message = {
    to: email,
    from: publisher,
    subject: 'todo subject', // todo добавить timestamp - таким образом чтобы было проще искать
    html: '<br>',
    text: 'required text', // todo здесь будет текст StoryLanguage с шифрованным описанием всей истории абстракта
    attachments: [attachment],
    sendAt: date,
    headers,
    categories: 'transactional',
  };
  const [mailResult] = await sgMail.send(message);
  if (!mailResult.complete) {
    throw new Error('sgMail send not completed');
  }
  return message;
};
/**
 * @param {Mail} mail - mail
 * @returns {Promise<undefined>}
 */
const read = async (mail) => {
  const { from, headers, attachments } = mail;
  // имя бота с которого было отправлено письмо. пока верим всем ботам с таким хедером
  if (headers['x-bot']) {
    if (attachments) {
      for (const abstract of await Attachment.read(mail)) {
        abstract.telegram_message_id = headers['x-bot-telegram-message-id'];
        abstract.creator = headers['x-bot-creator'];
        abstract.publisher = from;
        abstract.mail_uid = mail.uid;
        await abstract.commit();
      }
    }
  } else {
    // todo когда приходит письмо не от бота, нужно разбирать адреса и прочее и делать новый post с отправкой письма в формате forward
    //  ...
  }
};

module.exports = {
  post,
  read,
};
