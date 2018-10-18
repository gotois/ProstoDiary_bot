const $$ = require('./database.promise.js');
/**
 *
 * @param {number} user_id - user id
 * @returns {Promise}
 */
const getAll = user_id => {
  return $$(
    `SELECT entry, date_added
    FROM entries
    WHERE user_id = $1
    ORDER BY date_added ASC`,
    [user_id]
  );
};
/**
 * TODO: фича. День начинается с рассвета и до следующего рассвета (вместо привычного дня времени)
 *
 * @param {number} user_id - user id
 * @param {string|Date} date - like 2016-12-01
 * @returns {Promise}
 */
const _get = (user_id, date) => {
  switch (date.constructor) {
    case Date: {
      date = date.toJSON().substr(0, 10);
      break;
    }
    case String: {
      
      break;
    }
    default: {
      return Promise.reject('Wrong date type');
    }
  }
  
  const from = `'${date} 00:00:00'::timestamp`;
  const until = `'${date} 23:59:59'::timestamp`;
  
  return $$(`SELECT entry, date_added
    FROM entries
    WHERE (user_id = $1) AND date_added BETWEEN ${from} AND ${until}`, [user_id]
  );
};
/**
 *
 * @param {number} user_id - user id
 * @param {string} entry - entry
 * @param {number} telegram_entry_id - telegram entry id
 * @param {Date} date_modified - date
 * @param {Date|undefined} date_added - date
 * @returns {Promise}
 */
const _post = (user_id, entry, telegram_entry_id, date_modified, date_added = new Date()) => {
  return $$(
    `INSERT INTO entries (user_id, entry, telegram_entry_id, date_modified, date_added)
    VALUES ($1, $2, $3, $4, $5)`,
    [user_id, entry, telegram_entry_id, date_modified, date_added]
  );
};
/**
 *
 * @param {number} user_id - user id
 * @param {string} entry - entry
 * @param {Date} date_modified - date
 * @param {number} telegram_entry_id - date
 * @returns {Promise}
 */
const _put = (user_id, entry, date_modified, telegram_entry_id) => {
  return $$(
    `UPDATE entries
    SET entry = $2, date_modified = $3
    WHERE (user_id = $1 AND telegram_entry_id = $4)`,
    [user_id, entry, date_modified, telegram_entry_id]
  );
};
/**
 * @param {number} user_id - user id
 * @param {number} telegram_entry_id - telegram entry id
 * @returns {Promise}
 */
const _delete = (user_id, telegram_entry_id) => {
  return $$(
    `DELETE FROM entries
    WHERE (user_id = $1 AND telegram_entry_id = $2)`,
    [user_id, telegram_entry_id]
  );
};
/**
 * Удаление данных из БД
 *
 * @param {number} user_id - id user
 * @returns {Promise}
 */
const clear = user_id => {
  return $$(
    `DELETE FROM entries
    WHERE user_id = $1`,
    [user_id]
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
