const format = require('date-fns/format');
const fromUnixTime = require('date-fns/fromUnixTime');
const imapService = require('../../services/imap.service');
const logger = require('../../services/logger.service');

/**
 * @description Запуск imap считывателя пришедших писем за сегодня
 * @param {string} info - botTable
 * @param {string} info.email - botTable email
 * @param {string} info.password - botTable Password
 * @param {string} info.botSecretKey - botTable secret_key
 * @returns {Promise<void>}
 */
module.exports = async function({ email, password, botSecretKey }) {
  const imap = imapService(
    {
      host: 'imap.yandex.ru',
      port: 993,
      user: email,
      password: password,
    },
    botSecretKey,
  );
  // находим письма за сегодняшний день
  // считываем их содержимое и записываем в БД
  const today = format(
    fromUnixTime(Math.round(new Date().getTime() / 1000)),
    'MMM dd, yyyy',
  );
  const emails = await imap.search(['ALL', ['SINCE', today]]);
  // todo сохранять необработанные письма в Story
  // ...
  logger.info(emails);
};
