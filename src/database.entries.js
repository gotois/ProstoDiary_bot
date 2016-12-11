const $$ = require('./database.promise');
/***
 *
 * @param user_id
 */
function getAll(user_id) {
  return $$(
    `SELECT entry, date_added FROM entries 
    WHERE 
    user_id = $1`,
    [user_id]
  );
}
/***
 *
 * @param user_id
 * @param date {String} like 2016-12-01
 */
function get(user_id, date) {
  let from = `${date} 0:0:0`;
  let until = `${date} 23:59:59`;
  return $$(
    `SELECT entry, date_added FROM entries
    WHERE
    (user_id = $1 AND date_added >= $2 AND date_added <= $3)`,
    [user_id, from, until]
  );
}
/***
 *
 * @param user_id
 * @param entry
 * @param telegram_entry_id
 * @param date_modified
 * @param date_added
 */
function post(user_id, entry, telegram_entry_id, date_modified, date_added = new Date()) {
  return $$(
    `INSERT INTO entries (user_id, entry, telegram_entry_id, date_modified, date_added) 
    VALUES
    ($1, $2, $3, $4, $5)`,
    [user_id, entry, telegram_entry_id, date_modified, date_added]
  );
}
/***
 *
 * @param user_id
 * @param entry
 * @param date_modified
 * @param telegram_entry_id
 */
function put(user_id, entry, date_modified, telegram_entry_id) {
  return $$(
    `UPDATE entries
    SET entry = $2, date_modified = $3
    WHERE
    (user_id = $1 AND telegram_entry_id = $4)`,
    [user_id, entry, date_modified, telegram_entry_id]
  );
}
/***
 * Удаление данных из БД
 * @param user_id
 */
function clear(user_id) {
  return $$(
    `DELETE from entries
    WHERE
    user_id = $1`,
    [user_id]
  );
}

module.exports = {
  post,
  put,
  get,
  getAll,
  clear
};
