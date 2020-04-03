const logger = require('../../../lib/log');
const package_ = require('../../../../package.json');
const { pool, NotFoundError } = require('../../../db/sql');
const passportQueries = require('../../../db/passport');
const { mail } = require('../../../lib/sendgrid');
const pddService = require('../../../services/pdd.service');
const twoFactorAuthService = require('../../../services/2fa.service');
const oauthService = require('../../../services/oauth.service');
const cryptService = require('../../../services/crypt.service');
const { pack } = require('../../../services/archive.service');
const { IS_PRODUCTION, SERVER } = require('../../../environment');
const template = require('../../views/registration');

module.exports = class OAUTH {
  // подтверждение авторизации oauth. Сначала переходить сначала по ссылке вида https://cd0b2563.eu.ngrok.io/connect/yandex
  // Через localhost не будет работать
  constructor() {
    // здесь устанавливать подключение в БД
  }
  async callback(request, response) {
    logger.info('web:oauth');
    try {
      const { grant } = request.session;
      switch (grant.provider) {
        case 'yandex':
        case 'facebook': {
          if (grant.response.error) {
            throw new Error(grant.response.error.error_message);
          }
          break;
        }
        default: {
          throw new Error('unknown provider: ' + grant.provider);
        }
      }
      const result = await oauth({
        [grant.provider]: {
          ...grant.response,
          access_token: response.access_token,
        },
      });
      response.status(200).send(result);
    } catch (error) {
      response.status(400).json(error);
    }
  }
  registration(request, response) {
    response.status(200).send(template());
  }
};

/**
 * @param {*} transactionConnection - transactionConnection
 * @param {object} oauth - oauth providers
 * @returns {Promise<*>}
 */
const getPassport = async (
  transactionConnection,
  { telegram_id = null, yandex_id = null, facebook_id = null },
) => {
  const passportTable = await transactionConnection.maybeOne(
    passportQueries.selectAll(telegram_id, yandex_id, facebook_id),
  );
  if (!passportTable) {
    throw new NotFoundError('Passport not found');
  }
  return passportTable;
};
/**
 * fixme есть уязвимость, нужно усложнить выборку, используя oauth провайдеры
 *
 * @param {*} transactionConnection - transactionConnection
 * @param {object} oauth - oauth providers
 * @returns {Promise<*>}
 */
const updateOauthPassport = async (
  transactionConnection,
  { telegram, yandex, facebook },
) => {
  if (telegram) {
    const passportTable = await getPassport(transactionConnection, {
      telegram_id: telegram.from.id,
    });
    await transactionConnection.query(
      passportQueries.updateTelegramPassportByPassportId(
        telegram,
        passportTable.id,
      ),
    );
    return passportTable;
  }
  if (yandex) {
    const yandexPassport = await oauthService.yandex(yandex.raw);
    const passportTable = await getPassport(transactionConnection, {
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
    const passportTable = await getPassport(transactionConnection, {
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
  throw new Error('unknown passport');
};
/**
 * @param {*} transactionConnection - sql transaction
 * @param {object} oauth - oauth providers
 */
const createOauthPassport = async (
  transactionConnection,
  { yandex = {}, facebook = {}, telegram = {} },
) => {
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
  const passport = await transactionConnection.one(
    passportQueries.createPassport({
      email: primaryEmail,
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
        <h2>Шаг 2: Сохраните ваш мастер ключ.</h2>
        <p>Сохраните ваш секретный ключ в надежном и секретном месте оффлайн:
          <strong>${secret.masterPassword}</strong>
        </p>
        <h3>Сохраните открытые и закрытые ключи SSL</h3>
        <p>* Находятся в атачменте</p>
        <br>
        <h2>Шаг 3: Активируйте бота.</h2>
        <p>Пришлите <a href="https://prosto-diary.gotointeractive.com/">ProstoDiary_bot</a> сгенерированный токен от двухфакторной аутентификации.</p>
        <h2>Шаг 4: Выберите и активируйте ассистента.</h2>
        <p><a href="${SERVER.HOST}/marketplace">выберите ассистента</a>. Введите серверу OIDC данные своего bot email и password</p>
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
  } catch (error) {
    logger.error(error);
    await pddService.deleteYaMail(uid);
    throw error;
  }
};

/**
 * @description Обновление данных паспорта
 * @param {object} requestObject - request object
 * @returns {Promise<string>}
 */
async function oauth(requestObject) {
  logger.info('oauth');
  // todo возможно telegram предстоит убрать - так как у него нет oauth
  const { yandex, facebook, telegram } = requestObject;
  if (!yandex && !facebook && !telegram) {
    throw new Error('Unknown provider oauth');
  }
  const result = await pool.connect(async (connection) => {
    const transactionResult = await connection.transaction(
      async (transactionConnection) => {
        try {
          await updateOauthPassport(transactionConnection, {
            telegram,
            yandex,
            facebook,
          });
          // todo надо дополнительно отправлять письмо
          return 'Вы успешно обновили данные своего паспорта.';
        } catch (error) {
          if (error instanceof NotFoundError) {
            await createOauthPassport(transactionConnection, {
              telegram,
              yandex,
              facebook,
            });
            return 'На привязанную почту вам отправлено письмо от вашего бота. Следуйте инструкциям в письме.';
          }
          logger.error(error);
          throw error;
        }
      },
    );
    return transactionResult;
  });
  return result;
}
