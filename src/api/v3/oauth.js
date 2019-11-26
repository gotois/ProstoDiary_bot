const jsonld = require('jsonld');
const package_ = require('../../../package');
const { sql, pool } = require('../../core/database');
const { mail } = require('../../services/sendgridmail.service');
const mailService = require('../../services/mail.service');
const twoFactorAuthService = require('../../services/2fa.service');
const oauthService = require('../../services/oauth.service');
// todo использовать свои схемы - "https://gotointeractive.com/#organization",
const yandexLD = async (parameters) => {
  const compacted = await jsonld.compact(
    {
      'http://xmlns.com/foaf/0.1/name': parameters.real_name,
      'http://schema.org/gender': parameters.sex,
      'http://xmlns.com/foaf/0.1/nick': parameters.login,
      'http://xmlns.com/foaf/0.1/mbox': {
        '@id': `mailto://${parameters.default_email}`,
      },
      'http://xmlns.com/foaf/0.1/img': {
        '@id': `https://avatars.mds.yandex.net/get-yapic/${parameters.default_avatar_id}/islands-middle`,
      },
      // fixme неправильно сериализуется
      // 'http://schema.org/birthDate': {
      //   '@id': parameters.birthday,
      // },
    },
    'https://json-ld.org/contexts/person.jsonld',
  );
  return compacted;
};
const facebookLD = async (parameters) => {
  const compacted = await jsonld.compact(
    {
      'http://xmlns.com/foaf/0.1/name': parameters.name,
      // 'http://schema.org/gender': params.gender, // может не быть
      'http://xmlns.com/foaf/0.1/mbox': {
        '@id': `mailto://${parameters.email}`,
      },
      // "http://xmlns.com/foaf/0.1/homepage": {"@id": "http://denis.baskovsky.ru/"},
      // "http://xmlns.com/foaf/0.1/title": "TeamLead",
    },
    'https://json-ld.org/contexts/person.jsonld',
  );
  return compacted;
};
// todo добавить JSON-LD из telegram

/**
 * @param {number} passportId - gotois passport uid
 * @returns {Promise<*>}
 */
const registration = async (passportId) => {
  const secret = await twoFactorAuthService.generateSecret({
    name: package_.name,
    symbols: true,
    length: 20,
  });
  const output = await pool.connect(async ({ transaction }) => {
    const result = await transaction(async (transactionConnection) => {
      // на будущее, бот сам следит за своей почтой, периодически обновляя пароли. Пользователя вообще не касается что данные сохраняются у него в почте
      const { email, password, uid } = await mailService.createYaMail(
        passportId,
      );
      // todo добавлять uid почты в session
      try {
        await transactionConnection.query(sql`INSERT INTO bot (passport_id, email, password, secret_key, secret_password)
    VALUES (${passportId}, ${email}, ${password}, ${secret.base32}, crypt(${secret.secretPassword}, gen_salt('bf', 8)))
`);
        await mail.send({
          to: passport.user_email,
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
        return `Вам отправлено письмо от вашего бота - ${email}. Пришлите сгенерированный токен от двухфакторной аутентификации.`;
      } catch (error) {
        await mailService.deleteYaMail(uid);
        throw error;
      }
    });
    return result;
  });
  return output;
};

const compactedLD = async ({ yandex, facebook, telegram }) => {
  let compacted = {};
  if (yandex) {
    const yaPassport = await oauthService.yandex(yandex.raw);
    compacted = {
      ...compacted,
      ...(await yandexLD(yaPassport)),
    };
  }
  if (facebook) {
    const fbPassport = await oauthService.facebook(facebook.response);
    compacted = {
      ...compacted,
      ...(await facebookLD(fbPassport)),
    };
  }
  return compacted;
};
/**
 * @param {*} transactionConnection
 * @param {*} passport_id
 * @returns {Promise<*>}
 */
const getPassport = async (transactionConnection, passport_id) => {
  const passportTable = await transactionConnection.maybeOne(sql`
SELECT * FROM passport WHERE id = ${passport_id}
`);
  return passportTable;
};
/**
 * @param {*} transactionConnection
 * @param {*} telegram
 * @param {*} yandex
 * @param {*} facebook
 * @returns {Promise<*>}
 */
const updatePassport = async (
  transactionConnection,
  { telegram, yandex, facebook },
) => {
  if (telegram) {
    const passportTable = await transactionConnection.query(sql`
UPDATE 
    passport
SET 
    telegram = ${JSON.stringify(telegram)}
WHERE 
    telegram = ${telegram.from.id}
`);
    return passportTable;
  }
  if (yandex) {
    const passportTable = await transactionConnection.query(sql`
UPDATE
    passport
SET
    yandex = ${JSON.stringify(yandex)}
WHERE
    yandex = ${yandex.xxxxxxxx}`);
    return passportTable;
  }
  if (facebook) {
    const passportTable = await transactionConnection.query(sql`
UPDATE
    passport
SET
    facebook = ${JSON.stringify(facebook)}
WHERE
    facebook = ${facebook}`);
    return passportTable;
  }
  throw new Error('todo email or phone ...');
};
/**
 * @param {*} transactionConnection
 * @returns {Promise<*>}
 */
const createPassport = async (
  transactionConnection,
  { yandex = null, facebook = null, telegram = null },
) => {
  const passportTable = await transactionConnection.query(sql`
INSERT INTO passport (yandex, facebook, telegram)
  VALUES (
  ${JSON.stringify(yandex.raw)},
  ${JSON.stringify(facebook)},
  ${JSON.stringify(telegram.from)}
)
`);
  const compacted = await compactedLD({ yandex, facebook, telegram });
  await transactionConnection.query(sql`
INSERT INTO ld (passport_id, jsonld)
  VALUES (${passportTable.id}, ${JSON.stringify(compacted)})
`);
  return passportTable;
};
/**
 * @description блокировки чтения/приема и общей работы бота
 * @param {object} requestObject - request object
 * @returns {Promise<void>}
 */
module.exports = async (requestObject) => {
  const { passport_id, yandex, facebook, telegram } = requestObject;
  if (yandex || facebook || telegram) {
    throw new Error('Unknown request');
  }
  const result = await pool.connect(async (connection) => {
    const result = await connection.transaction(
      async (transactionConnection) => {
        let passport = await getPassport(transactionConnection, passport_id);
        if (passport) {
          await updatePassport(transactionConnection, {
            telegram,
            yandex,
            facebook,
          });
        } else {
          passport = await createPassport(transactionConnection, {
            telegram,
            yandex,
            facebook,
          });
        }
        const botTable = await transactionConnection.maybeOne(sql`
SELECT
    activated
FROM
    bot
WHERE
    activated = true AND passport_id = ${passport.id}
`);
        if (botTable.activated) {
          return 'Вы успешно обновили данные своего паспорта';
        }
        const output = await registration(passport.id);
        return output;
      },
    );
    return result;
  });
  return result;
};
