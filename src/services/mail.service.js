const cryptoRandomString = require('crypto-random-string');
const { unpack } = require('./archive.service');
const logger = require('./logger.service');
const { post, get } = require('./request.service');
const AbstractText = require('../models/abstract/abstract-text');
const AbstractPhoto = require('../models/abstract/abstract-photo');
const AbstractDocument = require('../models/abstract/abstract-document');

/**
 * @param {Mail} mail - mail
 * @returns {Promise<Array<Abstract>>}
 */
const createAbstract = async ({ attachments, date }) => {
  const abstracts = [];
  for (const attachment of attachments) {
    const {
      content,
      contentType,
      // transferEncoding,
      // generatedFileName,
      // contentId,
      // checksum,
      // length,
      // contentDisposition,
      // fileName,
    } = attachment;
    // if (transferEncoding !== 'base64') {
    //   continue;
    // }
    switch (contentType) {
      case 'plain/text': {
        abstracts.push(new AbstractText(content, contentType, date));
        break;
      }
      case 'image/png':
      case 'image/jpeg': {
        abstracts.push(new AbstractPhoto(content, contentType, date));
        break;
      }
      case 'application/pdf':
      case 'application/xml': {
        abstracts.push(new AbstractDocument(content, contentType, date));
        break;
      }
      case 'application/zip':
      case 'multipart/x-zip': {
        for await (const [_fileName, zipBuffer] of unpack(content)) {
          abstracts.push(new AbstractDocument(zipBuffer, contentType, date));
        }
        break;
      }
      case 'application/octet-stream': {
        abstracts.push(new AbstractText(content, contentType, date));
        break;
      }
      default: {
        // todo: тогда нужен разбора html и text самостоятельно из письма
        logger.log('info', 'Unknown mime type ' + contentType);
      }
    }
  }
  return abstracts;
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
      for (const abstract of await createAbstract(mail)) {
        console.log('abstract', abstract);
        // abstract.telegram_message_id = headers['x-bot-telegram-message-id'];
        // abstract.creator = headers['x-bot-creator'];
        abstract.publisher = from;
        abstract.mail_uid = mail.uid;
        await abstract.commit();
      }
    }
  } else {
    // todo когда приходит письмо не от бота, нужно разбирать адреса и прочее и делать новый post с отправкой письма в формате forward
    //  ...разделить read в два метода - первый будет анализировать, второй читать и записывать
  }
};
/**
 * https://yandex.ru/dev/pdd/doc/reference/email-add-docpage/
 *
 * @param {string} www - params
 * @returns {Promise<string|Buffer|Error|*>}
 */
const createYaMail = async (www) => {
  const { domain, email, login, password } = generateEmailName(www);
  const HOST = 'pddimp.yandex.ru';
  const emailAdd = await post(
    `https://${HOST}/api2/admin/email/add`,
    {
      domain,
      login,
      password,
    },
    {
      PddToken: process.env.YA_PDD_TOKEN,
    },
  );
  if (emailAdd.error) {
    throw new Error(emailAdd.error);
  }
  const emailGetOauth = await post(
    `https://${HOST}/api2/admin/email/get_oauth_token`,
    {
      domain,
      login: emailAdd.login,
      uid: emailAdd.uid,
    },
    {
      PddToken: process.env.YA_PDD_TOKEN,
    },
  );
  if (emailGetOauth.error) {
    throw new Error(emailAdd.error);
  }
  await get(
    `https://passport.yandex.ru/passport?mode=oauth&access_token=${
      emailGetOauth['oauth-token']
    }&type=trusted-pdd-partner`,
  );
  return {
    ...emailAdd,
    ...emailGetOauth,
    email,
    login,
    password,
  };
};

// в качестве логина используем url переданного вебсайта
/**
 * @param {string} www - name
 * @returns {Promise<{password: string, email: string, domain: string}>}
 */
const generateEmailName = (www) => {
  const login = www.replace(new RegExp('^https?://', 'i'), '').toLowerCase();
  const domain = 'gotointeractive.com';
  const email = `${login}@${domain}`;
  // пароль генерируем случайным образом
  const password = cryptoRandomString({
    length: 30,
    characters: '🤘👍👌😎🤝😋😜✊💪🙏🆒🆕🆙🆓🆗⬆️🔝➕⭐️🌟💥🔥☀️🕺',
  });
  return {
    email,
    password,
    domain,
  };
};

module.exports = {
  read,
  createYaMail,
  generateEmailName,
};
