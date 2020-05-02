const { sql } = require('../sql');

module.exports = {
  selectUserByPhone(phone) {
    return sql`
        SELECT * FROM client.passport WHERE phone = ${phone}
    `;
  },
  // выборка соответствия почты к типу bot или user
  selectRoleByEmail(email) {
    return sql`
        SELECT * FROM client.roles WHERE email = ${email}
    `;
  },
  /**
   * @param {string} login - user email or telegram id
   * @param {string} password - bot master password
   * @returns {*}
   */
  checkByEmailAndMasterPassword(login, password) {
    return sql`SELECT 1 FROM client.passport AS passportUser, client.bot AS passportBot
WHERE (passportUser.email = ${login} OR passportUser.telegram_id = ${login})
AND
passportBot.master_password = crypt(${password}, master_password)
`;
  },
  /**
   * @param {string} login - botEmail
   * @param {string} password - MasterPassword
   * @returns {*}
   */
  getPassport(login, password) {
    return sql`SELECT
    *
FROM
    client.bot
WHERE
    email = ${login} OR email = ${login + '@gotointeractive.com'}
    AND master_password = crypt(${password}, master_password)
`;
  },
  activateByPassportId(passportId) {
    return sql`
UPDATE
    client.bot
SET
    activated = ${true}
WHERE
    passport_id = ${passportId}
`;
  },
  deactivateByPassportId(passportId) {
    return sql`
UPDATE
    client.bot
SET
    activated = ${false}
WHERE
    passport_id = ${passportId}
`;
  },
  /**
   * @param {uuid} id - user id
   * @returns {*}
   */
  selectUserById(id) {
    return sql`
      SELECT * FROM client.passport WHERE id = ${id}
    `;
  },
  /**
   * @todo rename select by user email or telegram id
   * @param {string} login - telegram user id or user email
   * @returns {*}
   */
  selectUserByEmail(login) {
    return sql`
      SELECT * FROM client.passport WHERE email = ${login} OR telegram_id = ${login}
    `;
  },
  selectBotByEmail(email) {
    return sql`
      SELECT * FROM client.bot WHERE email = ${email} AND activated = true
    `;
  },
  selectBotById(id) {
    return sql`SELECT
    *
FROM
    client.bot
WHERE
    id = ${id}
`;
  },
  selectByPassport(passportId) {
    return sql`SELECT
    *
FROM
    client.bot
WHERE
    passport_id = ${passportId}
`;
  },
  /**
   * @param {object} obj - bot object
   * @param {uid} obj.passportId - passport ID
   * @param {string} obj.email - email
   * @param {uid} obj.emailUID - email id
   * @param {string} obj.emailPassword - email password
   * @param {string} obj.masterPassword - master password
   * @param {string} obj.secretKey - secret key
   * @returns {*}
   */
  createBot({
    passportId,
    email,
    emailUID,
    emailPassword,
    secretKey,
    masterPassword,
  }) {
    return sql`
INSERT INTO client.bot
    (passport_id, email, email_uid, email_password, secret_key, master_password)
VALUES
    (
    ${passportId},
    ${email},
    ${emailUID},
    ${emailPassword},
    ${secretKey},
    crypt(${masterPassword}, gen_salt('bf', 8))
    )
`;
  },
  getPassportByEmail(email) {
    return sql`SELECT
    *
FROM
    client.passport
    WHERE email = ${email}
    LIMIT 1
`;
  },
  getPassports() {
    return sql`SELECT
    *
FROM
    client.passport
`;
  },
  selectPassportByAnyProvider(
    telegram_id,
    yandex_id = null,
    facebook_id = null,
  ) {
    return sql`
SELECT *
    FROM
client.passport
    WHERE
telegram_id = ${telegram_id} OR
yandex_id = ${yandex_id} OR
facebook_id = ${facebook_id}
`;
  },
  updateYandexPassportByPassportId(passport, session, passportUID) {
    return sql`
UPDATE
    client.passport
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
    client.passport
SET
    facebook_id = ${passport.id},
    facebook_passport = ${sql.json(passport)},
    facebook_session = ${sql.json(session)}
WHERE
    id = ${passportUID}
`;
  },
  // todo rename createClientPassport
  createPassport({
    email,
    phone,
    telegramPassport,
    facebookPassport,
    yandexPassport,
    facebookSession,
    yandexSession,
  }) {
    return sql`
INSERT INTO client.passport (
    email,
    phone,
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
    ${phone},
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
    id, email, phone
`;
  },
};
