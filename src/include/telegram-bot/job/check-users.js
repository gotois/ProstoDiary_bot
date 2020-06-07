const format = require('date-fns/format');
const fromUnixTime = require('date-fns/fromUnixTime');
const bot = require('../bot');
const imapService = require('../../../services/imap.service');
const logger = require('../../../lib/log');

module.exports = async (passport, botTable) => {
  try {
    // пингуем тем самым проверяем что пользователь активен
    await bot.sendChatAction(passport.telegram_id, 'typing');
  } catch (error) {
    logger.error(error.stack);
    switch (error.response && error.response.statusCode) {
      case 403: {
        // fixme отправлять oidc на деактивацию
        // await connection.query(
        //   passportQueries.deactivateByPassportId(passport.id),
        // );
        break;
      }
      default: {
        break;
      }
    }
    return;
  }
  // fixme неверно считать через jwt активацию, узнать что бот неактивирован можно только постфактум
  if (botTable.activated) {
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
  }
};
