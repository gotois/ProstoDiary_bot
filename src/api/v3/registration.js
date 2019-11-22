const pkg = require('../../../package');
const { mail } = require('../../services/sendgridmail.service');
const mailService = require('../../services/mail.service');
const jsonldService = require('../../services/jsonld.service');
const auth = require('../../services/auth.service');
const { sql, pool, NotFoundError } = require('../../core/database');
const yandexLD = async (parameters) => {
  const compacted = await jsonldService.compact(
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
      'http://schema.org/birthDate': {
        '@id': parameters.birthday,
      },
    },
    'https://json-ld.org/contexts/person.jsonld',
  );
  return compacted;
};
const facebookLD = async (parameters) => {
  const compacted = await jsonldService.compact(
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
/**
 * @param {any} requestObject - request
 * @returns {Promise<string|Error>}
 */
module.exports = async (requestObject) => {
  const { yandex, facebook, telegram } = requestObject;
  let compacted;
  if (yandex) {
    compacted = await yandexLD(yandex);
  } else if (facebook) {
    compacted = await facebookLD(facebook);
  } else {
    throw new Error('Unknown registration Oauth2');
  }

  const secret = await auth.generateSecret({
    name: pkg.name,
    symbols: true,
    length: 20,
  });
  const output = await pool.connect(async ({ transaction }) => {
    const passport = await transaction(async (transactionConnection) => {
      try {
        const data = await transactionConnection.one(sql`SELECT
    id
FROM
    passport
WHERE
    telegram = ${Number(telegram.from.id)}
`);
        return data;
      } catch (error) {
        if (!(error instanceof NotFoundError)) {
          throw error;
        }
      }
      // todo предусмотреть возможность регистраци вне телеграма (email, whatsapp, matrix)
      const data = await transactionConnection.one(sql`INSERT INTO passport (telegram)
    VALUES (${telegram.from.id})
RETURNING
    id
`);
      return data;
    });
    const result = await transaction(async (transactionConnection) => {
      // на будущее, бот сам следит за своей почтой, периодически обновляя пароли. Пользователя вообще не касается что данные сохраняются у него в почте
      const { email, password, uid } = await mailService.createYaMail(
        passport.id,
      );
      try {
        await transactionConnection.query(sql`INSERT INTO bot (passport_id, email, password, secret_key, secret_password)
    VALUES (${passport.id}, ${email}, ${password}, ${secret.base32}, crypt(${secret.secretPassword}, gen_salt('bf', 8)))
`);
        await transactionConnection.query(sql`INSERT INTO ld (passport_id, jsonld)
    VALUES (${passport.id}, ${JSON.stringify(compacted)})
`);
        await mail.send({
          to: yandex.default_email, // fixme: поддержать из compacted (включая данные facebook)
          from: email,
          subject: `Passport ${pkg.name}`,
          html: `
        <h1>Добро пожаловать в систему ${pkg.author.name}!</h1>
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
        // в случае ошибки, удаление созданного почтового ящика
        await mailService.deleteYaMail(uid);
        throw error;
      }
    });
    return result;
  });
  return output;
};
