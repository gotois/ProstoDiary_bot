const openpgp = require('openpgp');
const pkg = require('../../../package');
const { IS_AVA_OR_CI } = require('../../environment');
const { FakerText } = require('../../services/faker.service');
const sgMail = require('../../services/sendgridmail.service');
// todo отправка абстракта минуя формирование письма ?
//  НЕТ! в этом случае отправляем письмо на специально сгенерированный ящик gotois и после прочтения VZOR'ом удаляем
/**
 * @description отправляем письмо
 * @param {RequestObject} requestObject - requestObject
 * @returns {Promise<JsonRpc|JsonRpcError>}
 */
module.exports = async (requestObject) => {
  const {
    text,
    file,
    mime,
    publisher,
    creator,
    date = Math.round(new Date().getTime() / 1000),
    caption = null, // eslint-disable-line
    telegram_message_id = null,
    chat_id = null,
  } = requestObject;
  let buffer;
  if (text) {
    const fakeText = FakerText.text(text);
    // todo отправка данных на dialogflow, чтобы узнать интенты
    //  ...
    buffer = Buffer.from(fakeText);
  } else if (file) {
    if (Buffer.byteLength(file) === 0) {
      throw new Error('Empty file');
    }
    buffer = file;
  } else {
    throw new Error('Invalid params: text or buffer');
  }
  const encrypted = await openpgp.encrypt({
    message: openpgp.message.fromBinary(buffer),
    passwords: [creator.secret], // todo брать из pgp_secret
    compression: openpgp.enums.compression.zlib,
  });
  const content = Buffer.from(encrypted.data).toString('base64');
  const headers = {
    'x-bot': pkg.name,
    'x-bot-version': pkg.version,
  };
  const message = {
    personalizations: [{
      to: [{
        email: creator.email,
      }],
      headers,
      customArgs: {
        timestamp: date,
        test: IS_AVA_OR_CI,
        chat_id: chat_id,
        telegram_message_id: telegram_message_id,
      },
      subject: 'todo subject',
    }],
    from: {
      email: publisher,
    },
    replyTo: {
      email: 'bugs@gotointeractive.com',
      name: 'Bug gotois',
    },
    content: [
      {
        type: mime,
        value: content,
      },
    ],
    mailSettings: {
      // "sandbox_mode": {
      //   "enable": true // todo set true for CI and test
      // },
    },
    categories: [
      'transaction',
    ],
  };
  const [mailResult] = await sgMail.send(message);
  if (!mailResult.complete) {
    throw new Error('sgMail send not completed');
  }
  return Promise.resolve('📨');
};
