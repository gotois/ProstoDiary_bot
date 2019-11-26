module.exports = (t) => {
  const { telegram } = require('../../src/controllers');
  const {
    PING,
    BACKUP,
    DBCLEAR,
    START,
    HELP,
    SEARCH,
    EDITED_MESSAGE_TEXT,
    LOCATION,
  } = telegram;

  t.true(BACKUP.alias instanceof RegExp);
  t.true(DBCLEAR.alias instanceof RegExp);
  t.true(START.alias instanceof RegExp);
  t.true(HELP.alias instanceof RegExp);
  t.true(SEARCH.alias instanceof RegExp);
  t.true(typeof EDITED_MESSAGE_TEXT.alias === 'string');
  t.true(typeof LOCATION.alias === 'string');

  t.true(SEARCH.alias.test('/search something'));

  t.true(BACKUP.alias.test('/backup'));
  t.false(BACKUP.alias.test('/backup 1'));

  t.true(DBCLEAR.alias.test('/dbclear'));
  t.false(DBCLEAR.alias.test('/dbclear/'));

  t.true(LOCATION.alias === 'location');

  t.is(typeof PING.description, 'string');
};
