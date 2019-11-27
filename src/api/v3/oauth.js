const package_ = require('../../../package');
const logger = require('../../services/logger.service');
const { sql, pool, NotFoundError } = require('../../core/database');
const { mail } = require('../../services/sendgridmail.service');
const mailService = require('../../services/mail.service');
const twoFactorAuthService = require('../../services/2fa.service');
const oauthService = require('../../services/oauth.service');
/**
 * @param {*} transactionConnection - transactionConnection
 * @param {string} passportId - passport guid
 * @param {Array<string>} passportEmail - passport email
 */
const registration = async (
  transactionConnection,
  passportId,
  passportEmail,
) => {
  const secret = await twoFactorAuthService.generateSecret({
    name: package_.name,
    symbols: true,
    length: 20,
  });
  // на будущее, бот сам следит за своей почтой, периодически обновляя пароли. Пользователя вообще не касается что данные сохраняются у него в почте
  const { email, password, uid } = await mailService.createYaMail(passportId);
  try {
    await transactionConnection.query(sql`
INSERT INTO bot
    (passport_id, email, email_uid, password, secret_key, secret_password)
VALUES 
    (${passportId}, ${email}, ${uid}, ${password}, ${secret.base32}, crypt(${secret.secretPassword}, gen_salt('bf', 8)))
`);
    await mail.send({
      to: passportEmail,
      from: email,
      subject: `Passport ${package_.name}`,
      html: `
        <h1>Добро пожаловать в систему ${package_.author.name}!</h1>
        <h2>Шаг 1: Настройте двухфакторную аутентификацию.</h2>
        <p>Используйте камеру для распознавания QR-кода в приложении для двухэтапной аутентификации, например, Google Authenticator.</p>
        <img src="${secret.qr}" alt="${secret.base32}">
        <br>
        <h2>Шаг 2: Сохраните секретный ключ рекавери.</h2>
        <p>Сохраните ваш секретный ключ в надежном и секретном месте оффлайн: 
          <strong>${secret.secretPassword}</strong>
        </p>
        <br>
        <h2>Шаг 3: Активируйте бота.</h2>
        <p>Пришлите <a href="https://prosto-diary.gotointeractive.com/">ProstoDiary_bot</a> сгенерированный токен от двухфакторной аутентификации.</p>
      `,
    });
  } catch (error) {
    await mailService.deleteYaMail(uid);
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
  const passportTable = await transactionConnection.maybeOne(sql`
SELECT *
    FROM 
passport 
    WHERE
telegram_id = ${telegram_id} OR
yandex_id = ${yandex_id} OR
facebook_id = ${facebook_id}
`);
  if (!passportTable) {
    throw new NotFoundError('Passport not found');
  }
  return passportTable;
};
/**
 * @fixme
 * @param {*} transactionConnection - transactionConnection
 * @param {object} oauth - oauth providers
 * @returns {Promise<*>}
 */
const updatePassport = async (
  transactionConnection,
  { telegram, yandex, facebook },
) => {
  // fixme: уязвимость, нужно усложнить выборку, используя oauth провайдеры
  const passportTable = await getPassport(transactionConnection, {
    telegram_id: telegram.from.id,
  });
  console.log('------', passportTable);
  if (telegram) {
    await transactionConnection.query(sql`
UPDATE
    passport
SET
    telegram_id = ${telegram.from.id},
    telegram_session = ${JSON.stringify(telegram.from)}
WHERE
    id = ${passportTable.id}
`);
  }
  if (yandex) {
    const yaData = await oauthService.yandex(yandex.raw);
    console.log('yaData', yaData);

    await transactionConnection.query(sql`
UPDATE
    passport
SET
    yandex_id = ${yaData.client_id},
    yandex_session = ${JSON.stringify(yaData)}
WHERE
    id = ${passportTable.id}
`);
  }
  if (facebook) {
    const fbData = await oauthService.facebook(facebook.raw);
    await transactionConnection.query(sql`
UPDATE
    passport
SET
    facebook_id = ${fbData.id},
    facebook_session = ${JSON.stringify(fbData)}
WHERE
    id = ${passportTable.id}
`);
  }
  console.log('passportTable', passportTable);
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
  const passport = await transactionConnection.one(sql`
INSERT INTO passport (
  telegram_id,
  telegram_session,
  facebook_id,
  facebook_session, 
  yandex_id,
  yandex_session
)
VALUES (
  ${tgData ? tgData.id : null},
  ${tgData ? JSON.stringify(tgData) : null},
  ${fbData ? fbData.id : null},
  ${fbData ? JSON.stringify(facebook.raw) : null},
  ${yaData ? yaData.client_id : null},
  ${yaData ? JSON.stringify(yandex.raw) : null}
)
RETURNING id
`);
  await registration(transactionConnection, passport.id, passportEmails.flat());
};
/**
 * @description Обновление данных паспорта
 * @param {object} requestObject - request object
 * @returns {Promise<void>}
 */
module.exports = async (requestObject) => {
  const { yandex, facebook, telegram } = requestObject;
  if (!yandex && !facebook && !telegram) {
    throw new Error('Unknown provider oauth');
  }
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
};
