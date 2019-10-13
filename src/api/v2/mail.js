const jsonrpc = require('jsonrpc-lite');
const pkg = require('../../../package');
const { IS_AVA_OR_CI } = require('../../environment');
const sgMail = require('../../services/sendgridmail.service');
const Attachment = require('../../models/attachment');
/**
 * @description весь pipe работы с input - вставка и разбор логики voice, text, photo, document
 * @param {RequestObject} requestObject - requestObject
 * @returns {JsonRpc|JsonRpcError}
 */
module.exports = async (requestObject) => {
  const {
    buffer,
    date,
    mime,
    telegram_user_id,
    telegram_message_id,
    caption = ' empty ',
  } = requestObject.params;
  try {
    if (IS_AVA_OR_CI) {
      throw new Error('API not supported');
    }
    // получаем ввод, переводим его в текстовый формат или буфер (raw)
    const attachment = await Attachment.create(buffer, mime);
    const message = {
      to: 'denis@baskovsky.ru', // todo: специальный имейл созданный для бота
      from: 'no-reply@gotointeractive.com', // todo: creator from gotois
      subject: pkg.name,
      text: 'required text', // todo возможно сюда стоит добавлять caption
      attachments: [attachment],
      sendAt: date,
      headers: {
        'x-bot': pkg.name,
        'x-bot-telegram-message-id': String(telegram_message_id),
        'x-bot-telegram-user-id': String(telegram_user_id),
      },
    };
    // Отправляем переведенный текстовый формат или буфер из созданного бота письмом на специально сгенерированный ящик @gotointeractive.com
    const [mailResult] = await sgMail.send(message);
    if (!mailResult.complete) {
      throw new Error('mailResult not complete');
    }
    return jsonrpc.success(requestObject.id, '✅'); // ✓
  } catch (error) {
    return jsonrpc.error(requestObject.id, new jsonrpc.JsonRpcError(error, 99));
  }
};
