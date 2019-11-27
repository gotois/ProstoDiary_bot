const openpgp = require('openpgp');
const package_ = require('../../../package');
const { pool, sql } = require('../../core/database');
const { IS_AVA_OR_CI } = require('../../environment');
const { FakerText } = require('../../services/faker.service');
const { mail } = require('../../services/sendgridmail.service');
/**
 * @description Отправляем сообщение. Попадает на почту на специально сгенерированный ящик gotois и после прочтения VZOR'ом удаляем
 * @param {object} requestObject - requestObject
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
  const secretKey = await pool.connect(async (connection) => {
    const botTable = await connection.one(sql`
SELECT
    secret_key
FROM
    bot
WHERE
    email = ${creator}
`);
    return botTable.secret_key;
  });
  const encrypted = await openpgp.encrypt({
    message: openpgp.message.fromBinary(buffer),
    passwords: [secretKey],
    compression: openpgp.enums.compression.zlib,
  });
  const content = Buffer.from(encrypted.data).toString('base64');
  const headers = {
    'x-bot': package_.name,
    'x-bot-version': package_.version,
  };
  const message = {
    personalizations: [
      {
        to: [
          {
            email: creator,
          },
        ],
        headers,
        customArgs: {
          timestamp: date,
          test: IS_AVA_OR_CI,
          chat_id: chat_id,
          telegram_message_id: telegram_message_id,
        },
        subject: 'todo subject',
      },
    ],
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
    categories: ['transaction'],
  };
  const [mailResult] = await mail.send(message);
  if (!mailResult.complete) {
    throw new Error('sgMail send not completed');
  }
  return Promise.resolve('📨');
};
