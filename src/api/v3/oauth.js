const jsonld = require('jsonld');
const pkg = require('../../../package');
const { sql, pool } = require('../../core/database');
const { mail } = require('../../services/sendgridmail.service');
const mailService = require('../../services/mail.service');
const twoFactorAuthService = require('../../services/2fa.service');
const oauthService = require('../../services/oauth.service');

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

const registration = async (passport) => {
  const secret = await twoFactorAuthService.generateSecret({
    name: pkg.name,
    symbols: true,
    length: 20,
  });
  const output = await pool.connect(async ({ transaction }) => {
    const result = await transaction(async (transactionConnection) => {
      // на будущее, бот сам следит за своей почтой, периодически обновляя пароли. Пользователя вообще не касается что данные сохраняются у него в почте
      const { email, password, uid } = await mailService.createYaMail(
        passport.id,
      );
      // todo добавлять uid почты в session
      try {
        await transactionConnection.query(sql`INSERT INTO bot (passport_id, email, password, secret_key, secret_password)
    VALUES (${passport.id}, ${email}, ${password}, ${secret.base32}, crypt(${secret.secretPassword}, gen_salt('bf', 8)))
`);
        await mail.send({
          to: passport.user_email,
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
/**
 * @description блокировки чтения/приема и общей работы бота
 * @returns {Promise<void>}
 */
module.exports = async (requestObject) => {
  const { passport_id, yandex, facebook, telegram } = requestObject;
  let compacted;
  if (yandex) {
    const yaPassport = await oauthService.yandexPassportInfo(yandex.response);
    compacted = await yandexLD(yaPassport);
  } else if (facebook) {
    const fbPassport = await oauthService.facebookPassportInfo(facebook.response);
    compacted = await facebookLD(fbPassport);
  } else {
    throw new Error('Unknown registration Oauth2');
  }
  const passport = await pool.connect(async (connection) => {
    let passportId = passport_id;
    if (!passportId) {
      // todo предусмотреть возможность регистраци вне телеграма (email, whatsapp, matrix)
      const passportTable = await connection.one(sql`
INSERT INTO passport (telegram)
  VALUES (${telegram.from.id})
`);
      passportId = passportTable.id;
    }
    await connection.query(sql`
INSERT INTO ld (passport_id, jsonld)
  VALUES (${passportId}, ${JSON.stringify(compacted)})
`);
    const passportTable = await connection.one(sql`
SELECT
    id
FROM
    passport
WHERE
    telegram = ${Number(telegram.from.id)}
`);
    return passportTable;
  });
  // fixme: если не была проведена регистрация, проводим ее
  if (true) {
    const output = await registration(passport);
    return output;
  } else {
    return 'Вы успешно обновили данные OAuth';
  }
};
