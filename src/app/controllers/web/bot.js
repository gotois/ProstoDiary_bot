const { pool } = require('../../../db/sql');
const passportQueries = require('../../../db/passport');
const logger = require('../../../lib/log');
// eslint-disable-next-line
const twoFactorAuthService = require('../../../services/2fa.service');

module.exports = class Bot {
  constructor() {}
  // Авторизация и разблокировка чтения/приема и общей работы бота
  static async signin(request, response) {
    logger.info('signin', request.session.passportId);
    try {
      if (!request.session.passportId) {
        throw new Error('Session not found');
      }
      const passportId = request.session.passportId;
      await pool.connect(async (connection) => {
        const botTable = await connection.one(
          passportQueries.selectByPassport(passportId),
        );
        // Бот уже был деактивирован
        if (botTable.activated) {
          return;
        }
        /*
        const valid = twoFactorAuthService.verifyUser(passport.secret_key, token);
        if (!valid) {
          // todo Превышено число попыток входа. Начните снова через N секунд
          //  ...
        }
        */

        await connection.query(
          passportQueries.activateByPassportId(passportId),
        );
      });

      response.status(200).send('Бот активирован');
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  // блокировки чтения/приема и общей работы бота
  static async signout(request, response) {
    try {
      if (!request.session.passportId) {
        throw new Error('Session not found');
      }
      const passportId = request.session.passportId;
      await pool.connect(async (connection) => {
        const botTable = await connection.one(
          passportQueries.selectByPassport(passportId),
        );
        // Бот уже был деактивирован
        if (!botTable.activated) {
          return;
        }
        // todo: деактивировать почтовый ящик https://yandex.ru/dev/pdd/doc/reference/email-edit-docpage/
        //  ...
        await connection.query(
          passportQueries.deactivateByPassportId(passportId),
        );
      });
      response.status(200).send('Бот деактивирован');
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
};
