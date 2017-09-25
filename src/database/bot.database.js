const $$ = require('./database.promise.js');
/***
 *
 * @param user_id {Number}
 * @return {Promise}
 */
const getAll = user_id => {
  return $$(
    `SELECT entry, date_added FROM entries 
    WHERE user_id = $1
    ORDER BY date_added ASC`,
    [user_id]
  );
};
/***
 *
 * @param user_id {Number}
 * @param date {String} like 2016-12-01
 * @return {Promise}
 */
const get = (user_id, date) => {
  const from = `${date} 0:0:0`;
  const until = `${date} 23:59:59`;
  return $$(
    `SELECT entry, date_added FROM entries
    WHERE (user_id = $1 AND date_added >= $2 AND date_added <= $3)`,
    [user_id, from, until]
  );
};
/***
 *
 * @param user_id {Number}
 * @param entry {String}
 * @param telegram_entry_id {Number}
 * @param date_modified {Date}
 * @param date_added {Date|null}
 * @return {Promise}
 */
const post = (user_id, entry, telegram_entry_id, date_modified, date_added = new Date()) => {
  return $$(
    `INSERT INTO entries (user_id, entry, telegram_entry_id, date_modified, date_added) 
    VALUES ($1, $2, $3, $4, $5)`,
    [user_id, entry, telegram_entry_id, date_modified, date_added]
  );
};
/***
 *
 * @param user_id {Number}
 * @param entry {String}
 * @param date_modified {Date}
 * @param telegram_entry_id {Number}
 * @return {Promise}
 */
const put = (user_id, entry, date_modified, telegram_entry_id) => {
  return $$(
    `UPDATE entries
    SET entry = $2, date_modified = $3
    WHERE (user_id = $1 AND telegram_entry_id = $4)`,
    [user_id, entry, date_modified, telegram_entry_id]
  );
};
/**
 * @param user_id {Number}
 * @param telegram_entry_id {Number}
 * @return {Promise}
 */
const del = (user_id, telegram_entry_id) => {
  return $$(
    `DELETE from entries
    WHERE (user_id = $1 AND telegram_entry_id = $2)`,
    [user_id, telegram_entry_id]
  );
};
/***
 * Удаление данных из БД
 * @param user_id {Number}
 * @return {Promise}
 */
const clear = user_id => {
  return $$(
    `DELETE from entries
    WHERE user_id = $1`,
    [user_id]
  );
};

module.exports = {
  post,
  get,
  put,
  delete: del,
  getAll,
  clear,
};
