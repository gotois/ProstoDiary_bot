const { pool } = require('../../../db/sql');
const passportQueries = require('../../../db/selectors/passport');
const logger = require('../../../lib/log');
const yandexGraphAPI = require('../../../lib/yandex');
const facebookGraphAPI = require('../../../lib/facebook');
const package_ = require('../../../../package.json');
const { mail } = require('../../../lib/sendgrid');
const pddService = require('../../../services/pdd.service');
const twoFactorAuthService = require('../../../lib/2fa');
const { IS_PRODUCTION } = require('../../../environment');
const oauthFinishTemplate = require('../../../app/views/oauth/finish');
/**
 * @param {object} oauth - oauth providers
 */
module.exports = async function ({
  yandex = {},
  facebook = {},
  telegram = {},
  phone,
}) {
  try {
    logger.info('createOauthPassport');
    const passportEmails = [];
    let yaData;
    if (yandex.raw) {
      yaData = await yandexGraphAPI(yandex.raw);
      passportEmails.push(yaData.emails);
    }
    let fbData;
    if (facebook.raw) {
      fbData = await facebookGraphAPI(facebook.raw);
      passportEmails.push(fbData.email);
    }
    let tgData;
    if (telegram.from) {
      tgData = telegram.from;
    }
    if (passportEmails.length === 0) {
      throw new Error('Empty email');
    }
    const [primaryEmail] = passportEmails.flat();
    logger.info('pre.createPassport');

    const values = await pool.connect(async (connection) => {
      const transactionResult = await connection.transaction(
        async (transactionConnection) => {
          const passport = await transactionConnection.one(
            passportQueries.createPassport({
              email: primaryEmail,
              phone,
              telegramPassport: tgData,
              facebookPassport: fbData,
              yandexPassport: yaData,
              facebookSession: facebook.raw,
              yandexSession: yandex.raw,
            }),
          );

          // Регистрация письма

          const secret = await twoFactorAuthService.generateUserSecret({
            name: package_.name + (IS_PRODUCTION ? '' : ' DEV'),
            symbols: true,
            length: 20,
          });

          // на будущее, бот сам следит за своей почтой, периодически обновляя пароли. Пользователя вообще не касается что данные сохраняются у него в почте
          const { email, password, uid } = await pddService.createYaMail(
            passport.id,
          );
          try {
            logger.info('pre.createBot');
            await transactionConnection.query(
              passportQueries.createBot({
                passportId: passport.id,
                email,
                emailUID: uid,
                emailPassword: password,
                secretKey: secret.base32,
                masterPassword: secret.masterPassword,
              }),
            );
            logger.info('pre.mail');
            const subject = `Passport ${package_.name} ${
              IS_PRODUCTION ? 'production' : 'development'
            }`;
            await mail.send({
              to: passport.email,
              from: email,
              subject,
              html: oauthFinishTemplate({ secret, email }),
            });
            return {
              passport,
              message:
                'На привязанную почту вам отправлено письмо от вашего бота. ' +
                'Активируйте бота следуя инструкциям в письме.',
            };
          } catch (error) {
            logger.error(error.stack);
            await pddService.deleteYaMail(uid);
            throw error;
          }
        },
      );
      return transactionResult;
    });

    return Promise.resolve(values);
  } catch (error) {
    return Promise.reject(this.error(400, error.message, error));
  }
};
