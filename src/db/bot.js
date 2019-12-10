const { sql } = require('../core/database');

module.exports = {
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
    email = ${login}
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
  selectByEmail(email) {
    return sql`
      SELECT * FROM passport.bot WHERE email = ${email}
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
};
