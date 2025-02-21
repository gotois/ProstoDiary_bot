const MiniSearch = require('minisearch');
const { getCalendarsByUser } = require('../models/calendars.cjs');

const miniSearch = new MiniSearch({
  fields: ['title', 'details'],
  storeFields: ['title', 'details'],
});

async function indexAllCalendars(userId) {
  if (miniSearch.documentCount === 0) {
    const documents = [];
    for (const calendar of getCalendarsByUser(userId)) {
      console.log('calendar', calendar)
      documents.push({
        id: calendar.id,
        title: calendar.title,
        details: calendar.details,
      });
    }
    console.log('documents', documents)
    await miniSearch.addAllAsync(documents);
  }
}

module.exports.indexAllCalendars = indexAllCalendars;
module.exports.miniSearch = miniSearch;
module.exports.MiniSearch = MiniSearch;
