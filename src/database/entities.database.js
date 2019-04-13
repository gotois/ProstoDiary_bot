const { $$ } = require('./index');
/**
 *
 * @param {number} userId - user id
 * @returns {Promise}
 */
const getAll = (userId) => {
  return $$(
    `SELECT entry, date_added
    FROM entries
    WHERE user_id = $1
    ORDER BY date_added ASC`,
    [userId],
  );
};
/**
 * TODO: фича. День начинается с рассвета и до следующего рассвета (вместо привычного дня времени)
 *
 * @param {number} userId - user id
 * @param {string|Date} date - like 2016-12-01
 * @returns {Promise}
 */
const _get = (userId, date) => {
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

  return $$(
    `SELECT entry, date_added
    FROM entries
    WHERE (user_id = $1) AND date_added BETWEEN ${from} AND ${until}`,
    [userId],
  );
};
/**
 *
 * @param {number} userId - user id
 * @param {string} entry - entry
 * @param {number} telegramEntryId - telegram entry id
 * @param {Date} dateModified - date
 * @param {Date|undefined} dateAdded - date
 * @returns {Promise}
 */
const _post = (
  userId,
  entry,
  telegramEntryId,
  dateModified,
  dateAdded = new Date(),
) => {
  return $$(
    `INSERT INTO entries (user_id, entry, telegram_entry_id, date_modified, date_added)
    VALUES ($1, $2, $3, $4, $5)`,
    [userId, entry, telegramEntryId, dateModified, dateAdded],
  );
};
/**
 *
 * @param {number} userId - user id
 * @param {string} entry - entry
 * @param {Date} dateModified - date
 * @param {number} telegramEntryId - date
 * @returns {Promise}
 */
const _put = (userId, entry, dateModified, telegramEntryId) => {
  return $$(
    `UPDATE entries
    SET entry = $2, date_modified = $3
    WHERE (user_id = $1 AND telegram_entry_id = $4)`,
    [userId, entry, dateModified, telegramEntryId],
  );
};
/**
 * @param {number} userId - user id
 * @param {number} telegramEntryId - telegram entry id
 * @returns {Promise}
 */
const _delete = (userId, telegramEntryId) => {
  return $$(
    `DELETE FROM entries
    WHERE (user_id = $1 AND telegram_entry_id = $2)`,
    [userId, telegramEntryId],
  );
};
/**
 * Удаление данных из БД
 *
 * @param {number} userId - id user
 * @returns {Promise}
 */
const clear = (userId) => {
  return $$(
    `DELETE FROM entries
    WHERE user_id = $1`,
    [userId],
  );
};

module.exports = {
  post: _post,
  get: _get,
  put: _put,
  delete: _delete,
  getAll,
  clear,
};
