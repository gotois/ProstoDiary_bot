const bot = require('../../core/bot');
const logger = require('../../services/logger.service');
const { SignIn } = require('../telegram/signin.event');
const package_ = require('../../../package');
const { pool, NotFoundError } = require('../../core/database');
const passportQueries = require('../../db/passport');
const { mail } = require('../../lib/sendgrid');
const pddService = require('../../services/pdd.service');
const twoFactorAuthService = require('../../services/2fa.service');
const oauthService = require('../../services/oauth.service');
const cryptService = require('../../services/crypt.service');
const { pack } = require('../../services/archive.service');
const { IS_PRODUCTION } = require('../../environment');

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
  const passportTable = await getPassport(transactionConnection, {
    telegram_id: telegram.from.id,
  });
  if (telegram) {
    await transactionConnection.query(
      passportQueries.updateTelegramPassportByPassportId(
        telegram,
        passportTable.id,
      ),
    );
  }
  if (yandex) {
    const yandexPassport = await oauthService.yandex(yandex.raw);
    await transactionConnection.query(
      passportQueries.updateYandexPassportByPassportId(
        yandexPassport,
        yandex.raw,
        passportTable.id,
      ),
    );
  }
  if (facebook) {
    const fbPassport = await oauthService.facebook(facebook.raw);
    await transactionConnection.query(
      passportQueries.updateFacebookPassportByPassportId(
        fbPassport,
        facebook.raw,
        passportTable.id,
      ),
    );
  }
  return passportTable;
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
        chatId: telegram.chat && telegram.chat.id,
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
    // использовать v3/notify здесь не получится из-за того что только здесь насыщается passport
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
        <p>Находятся в атачменте</p>
        <br>
        <h2>Шаг 3: Активируйте бота.</h2>
        <p>Пришлите <a href="https://prosto-diary.gotointeractive.com/">ProstoDiary_bot</a> сгенерированный токен от двухфакторной аутентификации.</p>
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

module.exports = async (request, response) => {
  logger.info('web:preoauth');
  const { grant } = request.session;
  switch (grant.provider) {
    case 'yandex':
    case 'facebook': {
      if (grant.response.error) {
        return response.status(400).send(grant.response.error.error_message);
      }
      break;
    }
    default: {
      return response.status(404).send('unknown provider: ' + grant.provider);
    }
  }
  try {
    logger.info('web:oauth');
    const result = await oauth({
      [grant.provider]: {
        ...grant.response,
        access_token: response.access_token,
      },
      telegram: grant.dynamic && grant.dynamic.telegram, // если делаем прямой переход по урлу, то никакого telegram не будет
    });
    if (grant.dynamic && grant.dynamic.telegram) {
      await bot.sendMessage(grant.dynamic.telegram.chat.id, result);
      try {
        const signIn = new SignIn(grant.dynamic.telegram);
        await signIn.beginDialog();
      } finally {
        response.redirect('tg://resolve?domain=ProstoDiary_bot');
      }
      return;
    }
    return response.status(200).send(result);
  } catch (error) {
    response.status(400).json(error);
  }
};
