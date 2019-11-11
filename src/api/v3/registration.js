const pkg = require('../../../package');
const sgMail = require('../../services/sendgridmail.service');
const mailService = require('../../services/mail.service');
const auth = require('../../services/auth.service');
const { sql, pool } = require('../../core/database');
const { get } = require('../../services/request.service');
const validator = require('validator');

// todo: перенести это в oauth + сделать e2e тест для тех ссылок, что генерирует сам бот
const getJSONLD = async (www) => {
  if (!validator.isURL(www)) {
    throw new Error('wrong www');
  }
  const jsonld = {};
  // todo: это уже избыточно, авторизация делается через oauth
  const html = (await get(www)).toString('utf8');
  if (validator.isJSON(html)) {
    const ldObject = JSON.parse(html);
    for (const key in ldObject) {
      if (ldObject.hasOwnProperty(key)) {
        jsonld[key] = ldObject[key];
      }
    }
  } else {
    // todo добавить возможность указывать сайты визитки, где данные будут прописаны внутри тега script
  }
  const id = jsonld['@id'];
  const context = JSON.stringify(jsonld['@context']);
  const type = jsonld['@type'];
  const email = jsonld['email'];
  const url = jsonld['url'];
  const name = jsonld['name'];
  const sameAs = jsonld['sameAs'] || [];
  const telegram = jsonld['telegram'];

  return {
    id,
    context,
    type,
    email,
    url,
    name,
    sameAs,
    telegram,
  };
};

/**
 * @returns {SuccessObject}
 * @param requestObject
 */
module.exports = async (requestObject) => {
  // https://avatars.mds.yandex.net/get-yapic/15298/enc-ffa5107cc5808ac078e7e2ecd952eb4e981f41522136a7bc59e323e22b797ac3/islands-middle
  const { yandex, telegram } = requestObject;
  const secret = await auth.generateSecret({
    name: pkg.name,
    symbols: true,
    length: 20,
  });
  const passcode = secret.base32;

  // todo: sameAs будет содержать ссылку на провайдера yandex или telegram

  const output = await pool.connect(async ({ transaction }) => {
    const result = await transaction(async (transactionConnection) => {
      const jsonld = await transactionConnection.one(sql`
INSERT INTO jsonld (id, context, type, email, url, name, same_as)
    VALUES (${id}, ${context}, ${type}, ${email}, ${url}, ${name}, ${sql.array(sameAs, sql`text[]`)})
RETURNING
    id
`);
      const passport = await transactionConnection.one(sql`
INSERT INTO passport (jsonld_id, recover_passwords, secret, telegram, email, password)
    VALUES (${jsonld.id}, ${sql.array(secret.recoverPasswords, sql`text[]`)}, ${passcode}, ${telegram}, crypt(${masterEmail}, gen_salt('bf', 8)), crypt(${masterPassword}, gen_salt('bf', 8)))
RETURNING
    password
`);
      // на будущее, бот сам следит за своей почтой, периодически обновляя пароли. Пользователя вообще не касается что данные сохраняются у него в почте
      const yaMailResult = await mailService.createYaMail(
        'https://me.baskovsky.ru',
      );
      await sgMail.send({
        to: email,
        cc: yaMailResult.email,
        from: pkg.author.email,
        subject: 'Passport ProstoDiary',
        html: `
        <h1>Добро пожаловать в ${pkg.name}!</h1>
        <h2>Шаг 1: настройте двухфакторную аутентификацию.</h2>
        <p>Используйте камеру для распознавания QR-кода в приложении для двухэтапной аутентификации, например, Google Authenticator.</p>
        <img src="${secret.qrTwoAuthImage}" alt="${passcode}">
        <br>
        <h2>Шаг 2: подтвердите себя.</h2>
        <p>Пришлите <a href="https://prosto-diary.gotointeractive.com/">ProstoDiary_bot</a> сгенерированный токен от двухфакторной аутентификации.</p>
        <br>
        <h2>Шаг 3: сохраните ключи рекавери.</h2>
        <p>Сохраните рекавер ключи в надежном и секретном месте: ${JSON.stringify(
    secret.recoverPasswords,
  )}</p>
      `,
      });
      // todo: записывать логин и пароль в .htdigest
      //  ...
      return `Вам отправлено письмо, ${email}. Следуйте указаниям.`;
    });
    return result;
  });
  return output;
};
