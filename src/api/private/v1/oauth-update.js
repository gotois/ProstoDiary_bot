const { pool } = require('../../../db/sql');
const passportQueries = require('../../../db/selectors/passport');
const logger = require('../../../lib/log');
const yandexGraphAPI = require('../../../lib/yandex');
const facebookGraphAPI = require('../../../lib/facebook');

module.exports = async function ({ yandex, facebook, passportUID }) {
  try {
    logger.info('oauth:updateOauthPassport');
    const result = await pool.connect(async (transactionConnection) => {
      if (yandex) {
        const yandexPassport = await yandexGraphAPI(yandex.raw);
        await transactionConnection.query(
          passportQueries.updateYandexPassportByPassportId(
            yandexPassport,
            yandex.raw,
            passportUID,
          ),
        );
        return {
          message: 'Вы успешно обновили данные своего паспорта.',
        };
      } else if (facebook) {
        const fbPassport = await facebookGraphAPI(facebook.raw);
        await transactionConnection.query(
          passportQueries.updateFacebookPassportByPassportId(
            fbPassport,
            facebook.raw,
            passportUID,
          ),
        );
        return {
          message: 'Вы успешно обновили данные своего паспорта.',
        };
      }
      throw new Error('Unknown Passport');
    });

    // todo добавить еще отправку письма про апдейт паспорта
    // ...

    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
