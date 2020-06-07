const bot = require('../bot');
const logger = require('../../../lib/log');

module.exports = async (passport) => {
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
  }
};
