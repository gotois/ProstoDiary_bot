const { calendarsDB } = require('../libs/database.cjs');

function createCalendarsTable() {
  calendarsDB.exec(`
    CREATE TABLE if not exists calendars(
      id INTEGER PRIMARY KEY,
      user_id TEXT,
      message_id INTEGER,
      title TEXT,
      details TEXT NULL,
      location TEXT NULL,
      start INTEGER,
      end INTEGER,
      geo TEXT NULL
    ) STRICT
  `);
}

try {
  createCalendarsTable();
} catch (error) {
  console.warn(error);
}

module.exports.getCalendarMessage = (id) => {
  const query = calendarsDB.prepare(`SELECT * FROM calendars WHERE message_id == ${id}`);
  const events = query.all();

  return events[0];
};

module.exports.getCalendarsByUser = (userId) => {
  const query = calendarsDB.prepare(`SELECT * FROM calendars WHERE user_id == ${userId}`);
  const events = query.all();

  return events;
};

/**
 * @description сохранение в базу SQLite на временное хранилище
 * @param {object} calendar - объект события
 * @param {number} calendar.id - идентификатор сообщения
 * @param {string} calendar.userId - идентификатор пользователя
 * @param {string} calendar.title - заголовок события
 * @param {string} [calendar.details] - детали события
 * @param {string|null} [calendar.location] - местоположение события
 * @param {string} calendar.start - время начала события
 * @param {string} calendar.end - время окончания события
 * @param {number[]} [calendar.geo] - geo координата события
 */
module.exports.saveCalendar = ({ id, userId, title, details = '', location = null, start, end, geo = [] }) => {
  const insert = calendarsDB.prepare(`
    INSERT INTO calendars (message_id, user_id, title, details, location, start, end, geo)
    VALUES (:message_id, :user_id, :title, :details, :location, :start, :end, :geo)`);
  insert.run({
    message_id: id,
    user_id: userId,
    title: title,
    details: details,
    location: location,
    start: start,
    end: end,
    geo: geo ? JSON.stringify(geo) : undefined,
  });
};
