const datetime = require('../../services/date.service');
const dbEntries = require('../../database/entities.database');

// @deprecated: надо объединить с search.js
module.exports = async (match, currentUser) => {
  let getTime;
  // todo: должно быть естественным языком вида: /search покажи все покупки за прошлую неделю
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
  const date = datetime.convertToNormalDate(getTime);
  if (!datetime.isValidDate(date)) {
    throw new Error('Wrong date');
  }
  const rows = await dbEntries.get(currentUser.id, date);
  // todo: https://github.com/gotois/ProstoDiary_bot/issues/109
  // надо получать из значений только то что является едой и это передавать в foodService
  // ...
  return rows;
};
