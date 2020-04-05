const validator = require('validator');
const logger = require('../../../lib/log');
const package_ = require('../../../../package.json');
const { pool, NotFoundError } = require('../../../db/sql');
const passportQueries = require('../../../db/selectors/passport');
const { mail } = require('../../../lib/sendgrid');
const pddService = require('../../../services/pdd.service');
const twoFactorAuthService = require('../../../services/2fa.service');
const oauthService = require('../../../services/oauth.service');
const cryptService = require('../../../services/crypt.service');
const { pack } = require('../../../services/archive.service');
const { IS_PRODUCTION, SERVER } = require('../../../environment');
const registrationStartTemplate = require('../../views/registration/registration-start');
const registrationOauthTemplate = require('../../views/registration/registration-oauth');
const registrationSuccessTemplate = require('../../views/registration/registration-success');

module.exports = class OAUTH {
  // подтверждение авторизации oauth. Сначала переходить сначала по ссылке вида https://cd0b2563.eu.ngrok.io/connect/yandex
  // Через localhost не будет работать
  constructor() {
    // здесь устанавливать pool подключение в БД
  }
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
        const transactionResult = await connection.transaction(
          async (transactionConnection) => {
            try {
              const passport = await OAUTH.updateOauthPassport(
                transactionConnection,
                {
                  yandex,
                  facebook,
                },
              );
              // todo добавить еще отправку письма про апдейт паспорта
              // ...
              request.session.passportId = passport.id;
              return 'Вы успешно обновили данные своего паспорта.';
            } catch (error) {
              if (error instanceof NotFoundError) {
                const passport = await OAUTH.createOauthPassport(
                  transactionConnection,
                  {
                    yandex,
                    facebook,
                    phone,
                  },
                );
                request.session.passportId = passport.id;
                return 'На привязанную почту вам отправлено письмо от вашего бота. Активируйте бота следуя инструкциям в письме.';
              }
              logger.error(error);
              throw error;
            }
          },
        );
        return transactionResult;
      });
      logger.info(result);
      response.status(200).send(
        registrationSuccessTemplate({
          message: result,
        }),
      );
    } catch (error) {
      response.status(400).json(error);
    }
  }
  registrationStart(request, response) {
    response.status(200).send(registrationStartTemplate());
  }
  registrationOauth(request, response) {
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
      response.status(200).send(registrationOauthTemplate());
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  }
  /**
   * @param {*} transactionConnection - transactionConnection
   * @param {object} oauth - oauth providers
   * @returns {Promise<*>}
   */
  static async getPassport(
    transactionConnection,
    { telegram_id = null, yandex_id = null, facebook_id = null },
  ) {
    const passportTable = await transactionConnection.maybeOne(
      passportQueries.selectAll(telegram_id, yandex_id, facebook_id),
    );
    if (!passportTable) {
      throw new NotFoundError('Passport not found');
    }
    return passportTable;
  }
  /**
   * @todo есть уязвимость, нужно усложнить выборку, используя oauth провайдеры
   *
   * @param {*} transactionConnection - transactionConnection
   * @param {object} oauth - oauth providers
   * @returns {Promise<*>}
   */
  static async updateOauthPassport(
    transactionConnection,
    { yandex, facebook },
  ) {
    if (yandex) {
      const yandexPassport = await oauthService.yandex(yandex.raw);
      const passportTable = await OAUTH.getPassport(transactionConnection, {
        yandex_id: yandexPassport.client_id,
      });
      await transactionConnection.query(
        passportQueries.updateYandexPassportByPassportId(
          yandexPassport,
          yandex.raw,
          passportTable.id,
        ),
      );
      return passportTable;
    }
    if (facebook) {
      const fbPassport = await oauthService.facebook(facebook.raw);
      const passportTable = await OAUTH.getPassport(transactionConnection, {
        facebook_id: fbPassport.id,
      });
      await transactionConnection.query(
        passportQueries.updateFacebookPassportByPassportId(
          fbPassport,
          facebook.raw,
          passportTable.id,
        ),
      );
      return passportTable;
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
      yaData = await oauthService.yandex(yandex.raw);
      passportEmails.push(yaData.emails);
    }
    let fbData;
    if (facebook.raw) {
      fbData = await oauthService.facebook(facebook.raw);
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
    // todo нужно устанавливать минимально рабочий json-ld
    // const linkedData = await transactionConnection.one(ldQueries.createLD({}));
    // todo rename userPassport
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
      const { publicKey, privateKey } = await cryptService.generateRSA();
      logger.info('pre.createBot');
      const publicKeyCert = Buffer.from(publicKey);
      const privateKeyCert = Buffer.from(privateKey);
      await transactionConnection.query(
        passportQueries.createBot({
          passportId: passport.id,
          email,
          emailUID: uid,
          emailPassword: password,
          secretKey: secret.base32,
          masterPassword: secret.masterPassword,
          publicKeyCert,
          privateKeyCert,
        }),
      );
      logger.info('pre.pack');
      const keys = await pack([
        {
          buffer: publicKeyCert,
          filename: 'public_key.pem',
        },
        {
          buffer: privateKey,
          filename: 'private_key.pem',
        },
      ]);

      logger.info('pre.mail');
      await mail.send({
        to: passport.email,
        from: email,
        subject: `Passport ${package_.name}`,
        html: `
        <h1>Добро пожаловать в систему ${package_.author.name}!</h1>
        <h2>Шаг 1: Настройте двухфакторную аутентификацию.</h2>
        <p>Используйте камеру для распознавания QR-кода в приложении для двухэтапной аутентификации, например, Google Authenticator.</p>
        <img src="${secret.qr}" alt="${secret.base32}">
        <br>
        <h2>Шаг 2: Сохраните логин/пароль созданного бота в надежном и секретном месте.</h2>
        <p>
          <strong>EMAIL: ${email}</strong>
          <strong>PASSWORD: ${secret.masterPassword}</strong>
          <p>Дополнительно сохраните открытый и закрытый ключи SSL (* находятся в прикрепленных файлах)</p>
        </p>
        <br>
        <h2>Шаг 3: Активируйте бота и выберите ассистента.</h2>
        <p><a href="${SERVER.HOST}/bot/activate">[ Подтвердить регистрацию ]</a></p>
      `,
        attachments: [
          {
            content: keys.toString('base64'),
            filename: 'keys.zip',
            type: 'application/zip',
            disposition: 'attachment',
          },
        ],
      });
      return passport;
    } catch (error) {
      logger.error(error);
      await pddService.deleteYaMail(uid);
      throw error;
    }
  }
};
