const fileType = require('file-type');
const pkg = require('../../../package');
const { IS_CI } = require('../../environment');
const sgMail = require('../../services/sendgridmail.service');
/**
 * @param {Buffer} buffer - buffer
 * @param {string|undefined} type - mime type
 * @returns {{disposition: string, filename: string, content_id: string, type: string, content: string}}
 */
const createAttachment = (buffer, type) => {
  if (Buffer.byteLength(buffer) === 0) {
    throw new Error('Empty buffer');
  }
  let content;
  let filename = 'attachment';
  const content_id = 'attachmentid';
  if (type === 'plain/text') {
    content = buffer.toString('base64');
    filename += '.txt';
  } else {
    const fType = fileType(buffer);
    content = buffer.toString('base64');
    if (fType) {
      type = fType.mime;
      filename += '.' + fType.ext;
    }
  }
  return {
    content,
    filename,
    type,
    disposition: 'attachment',
    content_id,
  };
};

/**
 * @description весь pipe работы с input - вставка и разбор логики voice, text, photo, document
 * @param {Buffer} buffer - input
 * @param {object} options - options
 * @param {number} options.date - UNIX time
 * @returns {jsonrpc}
 */
module.exports = async (
  buffer,
  {
    date,
    type,
    telegram_user_id,
    telegram_message_id,
    caption = ' empty ',
  } = {},
) => {
  try {
    // step 1 получаем ввод, переводим его в текстовый формат или буфер (raw)
    // Отправляем переведенный текстовый формат или буфер из созданного бота письмом на специально сгенерированный ящик @gotointeractive.com (абстракт)
    const message = {
      to: 'denis@baskovsky.ru', // todo: специальный имейл созданный для бота
      from: 'no-reply@gotointeractive.com', // todo: специальный имейл бота от телеграм
      subject: 'prosto-diary', // todo: ?
      text: 'required text', // todo возможно сюда стоит добавлять caption
      attachments: [createAttachment(buffer, type)],
      sendAt: date,
      headers: {
        'x-bot': pkg.name,
        'x-bot-telegram-message-id': String(telegram_message_id),
        'x-bot-telegram-user-id': String(telegram_user_id),
      },
    };
    if (!IS_CI) {
      const [mailResult] = await sgMail.send(message);
      if (!mailResult.complete) {
        throw new Error('mailResult not complete');
      }
    }
    return {
      jsonrpc: '2.0',
      result: 'Saved',
    };
  } catch (error) {
    return {
      jsonrpc: '2.0',
      error: {
        message: error.message.toString(),
      },
    };
  }
};
