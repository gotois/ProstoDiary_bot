const { sql } = require('../core/database');

module.exports = {
  selectEmailByPassport(passportTable) {
    return sql`
      SELECT email FROM bot WHERE passport_id = ${passportTable.id};
    `;
  },
  checkByLoginAndPassword(login, password) {
    return sql`SELECT
    1
FROM
    bot
WHERE
    email = ${login}
    AND secret_password = crypt(${password}, secret_password)
`;
  },
  activateByPassportId(passportId) {
    return sql`
UPDATE
    bot
SET
    activated = ${true}
WHERE
    passport_id = ${passportId}
`;
  },
  deactivateByPassportId(passportId) {
    return sql`
UPDATE
    bot
SET
    activated = ${false}
WHERE
    passport_id = ${passportId}
`;
  },
  selectByPassport(passportTable) {
    return sql`SELECT
    *
FROM
    bot
WHERE
    passport_id = ${passportTable.id}
`;
  },
  createBot({ passportId, email, uid, password, secret }) {
    return sql`
INSERT INTO bot
    (passport_id, email, email_uid, password, secret_key, secret_password)
VALUES 
    (${passportId}, ${email}, ${uid}, ${password}, ${secret.base32}, crypt(${secret.secretPassword}, gen_salt('bf', 8)))
`;
  },
};
