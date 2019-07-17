const datetime = require('../../services/date.service');
const dbEntries = require('../../database/entities.database');
const crypt = require('../../services/crypt.service');

module.exports = async (match, currentUser) => {
  let getTime;
  let date;
  if (match[0] === '/get today') {
    getTime = new Date();
  } else if (match[0] === '/get week') {
    // TODO: https://github.com/gotois/ProstoDiary_bot/issues/54
    // Который отдаёт все за прошлую неделю
  } else if (match[0] === '/get month') {
    // ...
  } else if (match[0] === '/get year') {
    // ...
  } else {
    getTime = match[1].trim();
  }
  date = datetime.convertToNormalDate(getTime);
  if (!datetime.isNormalDate(date)) {
    throw new Error('Wrong date');
  }
  const rows = await dbEntries.get(currentUser.id, date);
  const decodeRows = rows.map(({ entry }) => {
    return crypt.decode(entry);
  });
  if (decodeRows.length === 0) {
    return 'Записей нет';
  }
  // todo: https://github.com/gotois/ProstoDiary_bot/issues/109
  // надо получать из значений только то что является едой и это передавать в foodService
  // ...
  return JSON.stringify(decodeRows, null, 2);
};
