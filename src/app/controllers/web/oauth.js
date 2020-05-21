const validator = require('validator');
const logger = require('../../../lib/log');
const package_ = require('../../../../package.json');
const { pool } = require('../../../db/sql');
const passportQueries = require('../../../db/selectors/passport');
const { mail } = require('../../../lib/sendgrid');
const pddService = require('../../../services/pdd.service');
const twoFactorAuthService = require('../../../services/2fa.service');
const yandexGraphAPI = require('../../../lib/yandex');
const facebookGraphAPI = require('../../../lib/facebook');
const { IS_PRODUCTION } = require('../../../environment');
const oauthFinishTemplate = require('../../views/oauth/finish');
const regStartTmpl = require('../../views/registration/registration-start');
const regOauthTmpl = require('../../views/registration/registration-oauth');
const regSuccessTmpl = require('../../views/registration/registration-success');

// @todo переделать под API и сделать статические методы
// подтверждение авторизации oauth. Сначала переходить сначала по ссылке вида https://cd0b2563.eu.ngrok.io/connect/yandex
// Через localhost не будет работать
module.exports = class OAUTH {
  /**
   * @param {Request} request - request
   * @param {Response} response - response
   */
  async callback(request, response) {
    logger.info('web:oauth');
    try {
      const { grant, phone } = request.session;
      switch (grant.provider) {
        case 'yandex':
        case 'facebook': {
          if (grant.response.error) {
            throw new Error(grant.response.error.error_message);
          }
          break;
        }
        default: {
          throw new Error('Unknown provider: ' + grant.provider);
        }
      }
      const { yandex, facebook } = {
        [grant.provider]: {
          ...grant.response,
          access_token: response.access_token,
        },
      };
      if (!yandex && !facebook) {
        throw new Error('Unknown provider oauth');
      }
      const result = await pool.connect(async (connection) => {
        const client = await connection.maybeOne(
          passportQueries.selectUserByPhone(phone),
        );
        if (client) {
          await OAUTH.updateOauthPassport(connection, client, {
            yandex,
            facebook,
          });
          // todo добавить еще отправку письма про апдейт паспорта
          // ...
          request.session.passportId = client.id;
          return 'Вы успешно обновили данные своего паспорта.';
        } else {
          // такого phone в БД нет
          const transactionResult = await connection.transaction(
            async (transactionConnection) => {
              const client = await OAUTH.createOauthPassport(
                transactionConnection,
                {
                  yandex,
                  facebook,
                  phone,
                },
              );
              request.session.passportId = client.id;
              // eslint-disable-next-line max-len
              return 'На привязанную почту вам отправлено письмо от вашего бота. Активируйте бота следуя инструкциям в письме.';
            },
          );
          return transactionResult;
        }
      });
      logger.info(result);
      response.status(200).send(
        regSuccessTmpl({
          message: result,
        }),
      );
    } catch (error) {
      response.status(400).json(error);
    }
  }
  /**
   * @param {Request} request - request
   * @param {Response} response - response
   */
  registrationStart(request, response) {
    logger.info('web:registrationStart');
    try {
      response.status(200).send(regStartTmpl());
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  /**
   * @param {Request} request - request
   * @param {Response} response - response
   */
  registrationOauth(request, response) {
    logger.info('web:registrationOauth');
    try {
      let { phone = '' } = request.body;
      phone = phone
        .replace('(', '')
        .replace(')', '')
        .replace('+', '')
        .replace(/-/g, '');
      if (!validator.isMobilePhone(phone, 'ru-RU')) {
        throw new Error(`${request.body.phone} Not a phone`);
      }
      request.session.phone = phone;
      response.status(200).send(regOauthTmpl());
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  /**
   * @param {*} transactionConnection - transactionConnection
   * @param {object} passportTable - passportTable
   * @param {object} oauth - oauth providers
   * @returns {Promise<*>}
   */
  static async updateOauthPassport(
    transactionConnection,
    passportTable,
    { yandex, facebook },
  ) {
    logger.info('oauth:updateOauthPassport');
    if (yandex) {
      const yandexPassport = await yandexGraphAPI(yandex.raw);
      await transactionConnection.query(
        passportQueries.updateYandexPassportByPassportId(
          yandexPassport,
          yandex.raw,
          passportTable.id,
        ),
      );
      return;
    } else if (facebook) {
      const fbPassport = await facebookGraphAPI(facebook.raw);
      await transactionConnection.query(
        passportQueries.updateFacebookPassportByPassportId(
          fbPassport,
          facebook.raw,
          passportTable.id,
        ),
      );
      return;
    }
    throw new Error('Unknown Passport');
  }
  /**
   * @param {*} transactionConnection - sql transaction
   * @param {object} oauth - oauth providers
   */
  static async createOauthPassport(
    transactionConnection,
    { yandex = {}, facebook = {}, telegram = {}, phone },
  ) {
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
    const { email, password, uid } = await pddService.createYaMail(passport.id);
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
      return passport;
    } catch (error) {
      logger.error(error.stack);
      await pddService.deleteYaMail(uid);
      throw error;
    }
  }
};
