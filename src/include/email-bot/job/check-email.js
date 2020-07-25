const format = require('date-fns/format');
const fromUnixTime = require('date-fns/fromUnixTime');
const Vzor = require('../services/imap-transport');
/**
 * @description Запуск imap считывателя писем
 * @param {object} options - root
 * @param {object} options.data - passport user
 * @param {string} options.data.email - botTable email
 * @param {string} options.data.password - botTable Password
 * @param {string} options.data.botSecretKey - botTable secret_key
 * @returns {Promise<*>}
 */
module.exports = async (options) => {
  const passport = options.data;
  // fixme неверно считать через jwt активацию, узнать что бот неактивирован можно только постфактум
  if (!passport.activated) {
    throw new Error('bot not activated');
  }
  const imap = new Vzor(
    {
      user: passport.email,
      password: passport.password,
    },
    passport.botSecretKey,
  );
  // находим письма за сегодняшний день
  const today = format(
    fromUnixTime(Math.round(new Date().getTime() / 1000)),
    'MMM dd, yyyy',
  );
  // считываем их содержимое
  const emails = await imap.search(['ALL', ['SINCE', today]]);
  // console.log(emails)

  // записываем в БД
  // todo сохранять необработанные письма в Story
  // ,,,

  // удаляем записанные в БД письма
  // await imap.remove(mail.uid);

  // '✅️'
  // '⚠️'
  return emails;
};
