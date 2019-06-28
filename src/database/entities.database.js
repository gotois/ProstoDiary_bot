const { $$ } = require('.');
/**
 *
 * @param {number} userId - user id
 * @returns {Promise<Array>}
 */
const getAll = async (userId) => {
  const result = await $$(
    `SELECT entry, date_added
    FROM entries
    WHERE user_id = $1
    ORDER BY date_added ASC`,
    [userId],
  );
  // TODO: надо сразу декодировать
  return result.rows;
};
/**
 * TODO: фича. День начинается с рассвета и до следующего рассвета (вместо привычного дня времени)
 *
 * @param {number} userId - user id
 * @param {string|Date} date - like 2016-12-01
 * @returns {Promise<Array>}
 */
const _get = async (userId, date) => {
  switch (date.constructor) {
    case Date: {
      date = date.toJSON().substr(0, 10);
      break;
    }
    case String: {
      break;
    }
    default: {
      throw new Error('Wrong date type');
    }
  }

  const from = `'${date} 00:00:00'::timestamp`;
  const until = `'${date} 23:59:59'::timestamp`;

  const result = await $$(
    `SELECT entry, date_added
    FROM entries
    WHERE (user_id = $1) AND date_added BETWEEN ${from} AND ${until}`,
    [userId],
  );
  // TODO: надо сразу декодировать
  return result.rows;
};
/**
 *
 * @param {number} userId - user id
 * @param {string} entry - entry
 * @param {number} telegramEntryId - telegram entry id
 * @param {Date} dateModified - date
 * @param {Date|undefined} dateAdded - date
 * @returns {Promise<Array>}
 */
const _post = async (
  userId,
  entry,
  telegramEntryId,
  dateModified,
  dateAdded = new Date(),
) => {
  const result = await $$(
    `INSERT INTO entries (user_id, entry, telegram_entry_id, date_modified, date_added)
    VALUES ($1, $2, $3, $4, $5)`,
    [userId, entry, telegramEntryId, dateModified, dateAdded],
  );
  // TODO: надо сразу декодировать
  return result.rows;
};
/**
 *
 * @param {number} userId - user id
 * @param {string} entry - entry
 * @param {Date} dateModified - date
 * @param {number} telegramEntryId - date
 * @returns {Promise<Array>}
 */
const _put = async (userId, entry, dateModified, telegramEntryId) => {
  const result = await $$(
    `UPDATE entries
    SET entry = $2, date_modified = $3
    WHERE (user_id = $1 AND telegram_entry_id = $4)`,
    [userId, entry, dateModified, telegramEntryId],
  );
  // TODO: надо сразу декодировать
  return result.rows;
};
/**
 * @param {number} userId - user id
 * @param {number} telegramEntryId - telegram entry id
 * @returns {Promise<Array>}
 */
const _delete = async (userId, telegramEntryId) => {
  const result = await $$(
    `DELETE FROM entries
    WHERE (user_id = $1 AND telegram_entry_id = $2)`,
    [userId, telegramEntryId],
  );
  // TODO: надо сразу декодировать
  return result.rows;
};
/**
 * Удаление данных из БД
 *
 * @param {number} userId - id user
 * @returns {Promise<Array<object>>}
 */
const clear = async (userId) => {
  const result = await $$(
    `DELETE FROM entries
    WHERE user_id = $1`,
    [userId],
  );
  // TODO: отдавать boolean если все закончилось хорошо
  return result.rows;
};
/**
 * @param {number} userId - id user
 * @param {number} telegramEntryId - telegram id
 * @returns {Promise<boolean>}
 */
const exist = async (userId, telegramEntryId) => {
  const result = await $$(
    `SELECT EXISTS(SELECT 1 FROM entries
    WHERE telegram_entry_id = $1 AND user_id = $2)`,
    [telegramEntryId, userId],
  );
  return result.rows[0].exists;
};

module.exports = {
  post: _post,
  get: _get,
  put: _put,
  delete: _delete,
  getAll,
  clear,
  exist,
};
