const { pool } = require('../../core/database');
const { pack } = require('../../services/archive.service');
const format = require('../../services/format.service');
const twoFactorAuthService = require('../../services/2fa.service');

/**
 * @param {number} telegram_user_id - user id
 * @param {string|Date} date - date
 * @example
 * get(111, '2016-12-01');
 *
 * @returns {Promise<Array>}
 */
// const _get = async (telegram_user_id, date) => {
//   switch (date.constructor) {
//     case Date: {
//       date = date.toJSON().slice(0, 10);
//       break;
//     }
//     case String: {
//       break;
//     }
//     default: {
//       throw new TypeError('Wrong type');
//     }
//   }
//   // todo: День начинается с рассвета и до следующего рассвета (вместо привычного дня времени)
//   // fixme: лучше сделать -12 часов и +12 часов
//   const from = `${date} 00:00:00`;
//   const until = `${date} 23:59:59`;
//   const result = await $$(
//     `SELECT DISTINCT user_t.context->>'queryText' AS TEXT, user_t.telegram_message_id
//      FROM user_story as user_t, history as history_t, bot_story as bot_t
//      WHERE bot_t.telegram_user_id = $1 AND history_t.created_at BETWEEN $2 AND $3`,
//     [telegram_user_id, from, until],
//   );
//   // TODO: надо сразу декодировать
//   // const decodeRows = rows.map(({ entry }) => {
//   //   return crypt.decode(entry);
//   // });
//   return result.rows;
// };

/**
 * @todo тексты брать из почты используя Vzor.search
 * @todo должен в том числе содержать StoryJSON в полном объеме и храниться в отдельном файле: story.json
 * @description backup
 * @param {object} requestObject - requestObject
 * @returns {Promise<*>}
 */
module.exports = async (requestObject) => {
  const { user, date, passcode, token, sorting = 'ASC' } = requestObject;
  const valid = await twoFactorAuthService.verify(passcode, token);
  if (!valid) {
    throw new Error('Wrong token');
  }
  const filename = `backup_${date}.txt`;
  const rows = await pool.connect(async (connection) => {
    // const rows = await connection.many(
    //   sql`SELECT 1 FROM jsonld WHERE telegram = ${telegram}`,
    // );
    // return rows;
  });

  // const result = await $$(
  //   `SELECT DISTINCT abstract_t.context->>'text' AS TEXT, abstract.created_at AS DATE
  //    FROM abstract AS abstract_t, message AS message_t
  //    JOIN history
  //    ON history.user_story_id = user_t.id
  //    WHERE bot_t.telegram_user_id = $1
  //    ORDER BY history.created_at ${sorting}`,
  //   [id],
  // );

  if (rows.length === 0) {
    throw new Error('Backup data is empty');
  }
  const formatData = format.formatRows(rows);
  const fileBuffer = await pack(formatData, filename);
  return {
    filename,
    fileBuffer,
  };
};
