const format = require('date-fns/format');
const fromUnixTime = require('date-fns/fromUnixTime');
const imapService = require('../../services/imap.service');

// eslint-disable-next-line no-unused-vars
const imap = imapService(
  {
    host: 'imap.yandex.ru',
    port: 993,
    user: botTable.email,
    password: botTable.password,
  },
  botTable.secret_key,
);
// находим письма за сегодняшний день
// считываем их содержимое и записываем в БД
// eslint-disable-next-line no-unused-vars
const today = format(
  fromUnixTime(Math.round(new Date().getTime() / 1000)),
  'MMM dd, yyyy',
);
// const emails = await imap.search(['ALL', ['SINCE', today]]);
// todo сохранять необработанные письма в Story
// ...
