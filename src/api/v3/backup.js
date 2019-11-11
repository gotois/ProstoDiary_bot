const { sql, pool } = require('../../core/database');
const { pack } = require('../../services/archive.service');
const format = require('../../services/format.service');
const auth = require('../../services/auth.service');
/**
 * @todo тексты брать из почты используя Vzor.search
 * @todo должен в том числе содержать StoryJSON в полном объеме и храниться в отдельном файле: story.json
 * @param {RequestObject} requestObject - requestObject
 * @returns {SuccessObject|JsonRpcError}
 */
module.exports = async (requestObject) => {
  const { user, date, passcode, token, sorting = 'ASC' } = requestObject;
  const valid = await auth.verify(passcode, token);
  if (!valid) {
    throw new Error('Wrong token');
  }
  const filename = `backup_${date}.txt`;
  const rows = await pool.connect(async (connection) => {
    const rows = await connection.many(
      sql`SELECT 1 FROM jsonld WHERE telegram = ${telegram}`,
    );
    return rows;
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
