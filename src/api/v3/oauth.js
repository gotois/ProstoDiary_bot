const package_ = require('../../../package');
const logger = require('../../services/logger.service');
const { pool, NotFoundError } = require('../../core/database');
const { mail } = require('../../lib/sendgrid');
const pddService = require('../../services/pdd.service');
const twoFactorAuthService = require('../../services/2fa.service');
const oauthService = require('../../services/oauth.service');
const passportQueries = require('../../db/passport');
const cryptService = require('../../services/crypt.service');
// const ldQueries = require('../../db/ld');
/**
 * @description Регистрация письма
 * @param {*} transactionConnection - transactionConnection
 * @param {object} passport - passport
 * @param {uid} passport.id - passport uid
 * @param {string} passport.email - passport email
 */
const registration = async (transactionConnection, passport) => {
  const secret = await twoFactorAuthService.generateUserSecret({
    name: package_.name,
    symbols: true,
    length: 20,
  });
  // на будущее, бот сам следит за своей почтой, периодически обновляя пароли. Пользователя вообще не касается что данные сохраняются у него в почте
  const { email, password, uid } = await pddService.createYaMail(passport.id);
  try {
    // todo нужно сохранять ключи в БД
    // eslint-disable-next-line no-unused-vars
    const { publicKey, privateKey } = await cryptService.generateRSA();
    await transactionConnection.query(
      passportQueries.createBot({
        passportId: passport.id,
        email,
        uid,
        password,
        secret,
      }),
    );
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
        <h2>Шаг 2: Запомните ваши ключи.</h2>
        <h3>Сохраните секретный ключ рекавери</h3>
        <p>Сохраните ваш секретный ключ в надежном и секретном месте оффлайн: 
          <strong>${secret.masterPassword}</strong>
        </p>
        <h3>Сохраните открытый ключ SSL</h3>
        <p>${JSON.stringify(publicKey)}</p>
        <br>
        <h2>Шаг 3: Активируйте бота.</h2>
        <p>Пришлите <a href="https://prosto-diary.gotointeractive.com/">ProstoDiary_bot</a> сгенерированный токен от двухфакторной аутентификации.</p>
      `,
    });
  } catch (error) {
    await pddService.deleteYaMail(uid);
    logger.error(error);
    throw error;
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
const updatePassport = async (
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
 * @param {*} transactionConnection
 * @param {object} oauth - oauth providers
 */
const createPassport = async (
  transactionConnection,
  { yandex = {}, facebook = {}, telegram = {} },
) => {
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
  await registration(transactionConnection, passport);
};
/**
 * @description Обновление данных паспорта
 * @param {object} requestObject - request object
 * @returns {Promise<string>}
 */
module.exports = async function(requestObject) {
  const { yandex, facebook, telegram } = requestObject;
  if (!yandex && !facebook && !telegram) {
    throw new Error('Unknown provider oauth');
  }
  try {
    const result = await pool.connect(async (connection) => {
      const transactionResult = await connection.transaction(
        async (transactionConnection) => {
          try {
            await updatePassport(transactionConnection, {
              telegram,
              yandex,
              facebook,
            });
            return 'Вы успешно обновили данные своего паспорта.';
          } catch (error) {
            if (error instanceof NotFoundError) {
              await createPassport(transactionConnection, {
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
  } catch (error) {
    return Promise.reject(this.error(400, error.message || 'db error'));
  }
};
