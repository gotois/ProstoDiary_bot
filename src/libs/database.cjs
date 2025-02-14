const { DatabaseSync } = require('node:sqlite');
const { DATABASE } = require('../environments/index.cjs');

module.exports.userDB = new DatabaseSync(DATABASE.USERS);
module.exports.calendarsDB = new DatabaseSync(DATABASE.CALENDARS);
module.exports.messageDB = new DatabaseSync(':memory:');
