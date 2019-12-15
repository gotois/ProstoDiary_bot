const { sql } = require('../core/database');

module.exports = {
  selectBotByUserEmail(login) {
    return sql`
SELECT
    email,
    passport_id
FROM
    passport.bot
WHERE
    email = ${login} OR email = ${login + '@gotointeractive.com'}
`;
  },
  selectEmailByPassport(passportTable) {
    return sql`
      SELECT email FROM passport.bot WHERE passport_id = ${passportTable.id};
    `;
  },
  checkByLoginAndPassword(login, password) {
    return sql`SELECT
    1
FROM
    passport.bot
WHERE
    email = ${login} OR email = ${login + '@gotointeractive.com'}
    AND master_password = crypt(${password}, master_password)
`;
  },
  activateByPassportId(passportId) {
    return sql`
UPDATE
    passport.bot
SET
    activated = ${true}
WHERE
    passport_id = ${passportId}
`;
  },
  deactivateByPassportId(passportId) {
    return sql`
UPDATE
    passport.bot
SET
    activated = ${false}
WHERE
    passport_id = ${passportId}
`;
  },
  selectUserByEmail(email) {
    return sql`
      SELECT * FROM passport.user WHERE email = ${email}
    `;
  },
  selectUserById(userId) {
    return sql`
      SELECT * FROM passport.user WHERE id = ${userId}
    `;
  },
  selectBotByEmail(email) {
    return sql`
      SELECT * FROM passport.bot WHERE email = ${email} AND activated = true
    `;
  },
  selectByPassport(passportId) {
    return sql`SELECT
    *
FROM
    passport.bot
WHERE
    passport_id = ${passportId}
`;
  },
  createBot({ passportId, email, uid, password, secret }) {
    return sql`
INSERT INTO passport.bot
    (passport_id, email, email_uid, password, secret_key, master_password)
VALUES 
    (${passportId}, ${email}, ${uid}, ${password}, ${secret.base32}, crypt(${secret.masterPassword}, gen_salt('bf', 8)))
`;
  },
  selectIdByTelegramId(telegram_id) {
    return sql`
SELECT 
    id, email
FROM 
    passport.user 
WHERE telegram_id = ${String(telegram_id)}
LIMIT 1
    `;
  },
  getPassports() {
    return sql`SELECT
    *
FROM
    passport.user
`;
  },
  selectAll(telegram_id, yandex_id = null, facebook_id = null) {
    return sql`
SELECT *
    FROM 
passport.user
    WHERE
telegram_id = ${telegram_id} OR
yandex_id = ${yandex_id} OR
facebook_id = ${facebook_id}
`;
  },
  updateTelegramPassportByPassportId(telegram, passportUID) {
    return sql`
UPDATE
    passport.user
SET
    telegram_id = ${telegram.from.id},
    telegram_passport = ${sql.json(telegram.from)}
WHERE
    id = ${passportUID}
`;
  },
  updateYandexPassportByPassportId(passport, session, passportUID) {
    return sql`
UPDATE
    passport.user
SET
    yandex_id = ${passport.client_id},
    yandex_passport = ${sql.json(passport)},
    yandex_session = ${sql.json(session)}
WHERE
    id = ${passportUID}
`;
  },
  updateFacebookPassportByPassportId(passport, session, passportUID) {
    return sql`
UPDATE
    passport.user
SET
    facebook_id = ${passport.id},
    facebook_passport = ${sql.json(passport)},
    facebook_session = ${sql.json(session)}
WHERE
    id = ${passportUID}
`;
  },
  createPassport({
    email,
    telegramPassport,
    facebookPassport,
    yandexPassport,
    facebookSession,
    yandexSession,
  }) {
    return sql`
INSERT INTO passport.user (
    email,
    telegram_id,
    telegram_passport,
    facebook_id,
    facebook_passport, 
    facebook_session, 
    yandex_id,
    yandex_passport,
    yandex_session
)
VALUES (
    ${email},
    ${telegramPassport ? telegramPassport.id : null},
    ${telegramPassport ? sql.json(telegramPassport) : null},
    ${facebookPassport ? facebookPassport.id : null},
    ${facebookPassport ? sql.json(facebookPassport) : null},
    ${facebookPassport ? sql.json(facebookSession) : null},
    ${yandexPassport ? yandexPassport.client_id : null},
    ${yandexPassport ? sql.json(yandexPassport) : null},
    ${yandexPassport ? sql.json(yandexSession) : null}
)
RETURNING 
    id, email
`;
  },
};
