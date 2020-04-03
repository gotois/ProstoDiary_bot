const validator = require('validator');
const cryptoRandomString = require('crypto-random-string');
const { post, get } = require('./request.service');
const { YANDEX } = require('../environment');
/**
 * @constant
 */
const PDD_YANDEX_HOST = 'pddimp.yandex.ru';
/**
 * @constant
 */
const YANDEX_PASSPORT_HOST = 'passport.yandex.ru';
/**
 * @todo в environment
 * @constant
 */
const DOMAIN = 'gotointeractive.com';
/**
 * @description удаление созданного почтового ящика
 * @param {number} uid - Yandex uid
 * @returns {Promise<void>}
 */
const deleteYaMail = async (uid) => {
  const emailDelete = await post(
    `https://${PDD_YANDEX_HOST}/api2/admin/email/del`,
    {
      domain: DOMAIN,
      uid: uid,
    },
    {
      PddToken: YANDEX.YA_PDD_TOKEN,
    },
  );
  if (emailDelete.error) {
    throw new Error(emailDelete.error);
  }
  return emailDelete;
};
/**
 * @todo вообще думаю что нужно заложить сценарий более читаемых имен
 * @param {uid|string} login - login
 * @returns {Promise<string|Buffer|Error|*>}
 * @see https://yandex.ru/dev/pdd/doc/reference/email-add-docpage/
 */
const createYaMail = async (login) => {
  if (validator.isURL(login)) {
    login = login.replace(new RegExp('^https?://', 'i'), '').toLowerCase();
  } else if (validator.isUUID) {
    login = login.toLowerCase().replace(/-/g, '').slice(0, 30);
  } else {
    throw new Error('Login wrong type');
  }
  const { email, password } = generateEmailName(login);
  const emailAdd = await post(
    `https://${PDD_YANDEX_HOST}/api2/admin/email/add`,
    {
      domain: DOMAIN,
      login,
      password,
    },
    {
      PddToken: YANDEX.YA_PDD_TOKEN,
    },
  );
  if (emailAdd.error) {
    throw new Error(emailAdd.error);
  }
  const emailGetOauth = await post(
    `https://${PDD_YANDEX_HOST}/api2/admin/email/get_oauth_token`,
    {
      domain: DOMAIN,
      login: emailAdd.login,
      uid: emailAdd.uid,
    },
    {
      PddToken: YANDEX.YA_PDD_TOKEN,
    },
  );
  if (emailGetOauth.error) {
    throw new Error(emailAdd.error);
  }
  await get(`https://${YANDEX_PASSPORT_HOST}/passport`, {
    mode: 'oauth',
    access_token: emailGetOauth['oauth-token'],
    type: 'trusted-pdd-partner',
  });
  return {
    ...emailAdd,
    ...emailGetOauth,
    email,
    login,
    password,
  };
};
/**
 * @description пароль генерируем случайным образом
 * @param {string} login - login
 * @returns {{password: string, email: string}}
 */
const generateEmailName = (login) => {
  const email = `${login}@${DOMAIN}`;
  const password = cryptoRandomString({
    length: 20,
    //🤘👍👌😎🤝😋😜✊💪🙏🆒🆕🆙🆓🆗⬆️🔝➕⭐️🌟💥🔥☀️🕺', todo - у яндекс стоят сильные ограничения, перейти потом на PhotonMail
    characters:
      '1234567890qwertyuiopasdfghjklzxcvbnm!@#$%^&*()-_=+[]{};:"\\|,.<>/?',
  });
  return {
    email,
    password,
  };
};

module.exports = {
  createYaMail,
  deleteYaMail,
};
