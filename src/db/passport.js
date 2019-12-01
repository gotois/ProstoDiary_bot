const { sql } = require('../core/database');

module.exports = {
  selectIdByTelegramId(telegram_id) {
    return sql`
SELECT 
    id 
FROM 
    passport.user 
WHERE telegram_id = ${telegram_id};
    `;
  },
  getPassports() {
    return sql`SELECT
    *
FROM
    passport.user
`;
  },
  selectAll(telegram_id, yandex_id, facebook_id) {
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
    telegram_passport = ${JSON.stringify(telegram.from)}
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
    yandex_passport = ${JSON.stringify(passport)},
    yandex_session = ${JSON.stringify(session)}
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
    facebook_passport = ${JSON.stringify(passport)},
    facebook_session = ${JSON.stringify(session)}
WHERE
    id = ${passportUID}
`;
  },
  createPassport({
    ld_id,
    telegramPassport,
    facebookPassport,
    yandexPassport,
    facebookSession,
    yandexSession,
  }) {
    return sql`
INSERT INTO passport.user (
    ld_id,
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
    ${ld_id},
    ${telegramPassport ? telegramPassport.id : null},
    ${telegramPassport ? JSON.stringify(telegramPassport) : null},
    ${facebookPassport ? facebookPassport.id : null},
    ${facebookPassport ? JSON.stringify(facebookPassport) : null},
    ${facebookPassport ? JSON.stringify(facebookSession) : null},
    ${yandexPassport ? yandexPassport.client_id : null},
    ${yandexPassport ? JSON.stringify(yandexPassport) : null},
    ${yandexPassport ? JSON.stringify(yandexSession) : null}
)
RETURNING 
    id
`;
  },
};
