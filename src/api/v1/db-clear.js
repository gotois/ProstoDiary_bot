const dbEntries = require('../../database/entities.database');

module.exports = async (currentUser) => {
  await dbEntries.clear(currentUser.id);
};
