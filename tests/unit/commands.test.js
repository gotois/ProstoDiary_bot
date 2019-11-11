module.exports = (t) => {
  const { commands } = require('../../src/controllers/telegram');
  const {
    PING,
    BACKUP,
    DBCLEAR,
    START,
    HELP,
    SET,
    SEARCH,
    EDITED_MESSAGE_TEXT,
    TEXT,
    LOCATION,
    VERSION,
  } = commands;

  t.true(BACKUP.alias instanceof RegExp);
  t.true(DBCLEAR.alias instanceof RegExp);
  t.true(START.alias instanceof RegExp);
  t.true(HELP.alias instanceof RegExp);
  t.true(SET.alias instanceof RegExp);
  t.true(SEARCH.alias instanceof RegExp);
  t.true(VERSION.alias instanceof RegExp);
  t.true(typeof EDITED_MESSAGE_TEXT.alias === 'string');
  t.true(typeof TEXT.alias === 'string');
  t.true(typeof LOCATION.alias === 'string');

  t.true(SET.alias.test('/set 2018-03-18 something'));
  t.false(SET.alias.test('/set something'));

  t.true(SEARCH.alias.test('/search something'));

  t.true(BACKUP.alias.test('/backup'));
  t.false(BACKUP.alias.test('/backup 1'));

  t.true(DBCLEAR.alias.test('/dbclear'));
  t.false(DBCLEAR.alias.test('/dbclear/'));

  t.true(LOCATION.alias === 'location');

  t.true(VERSION.alias.test('/version'));
  t.is(typeof PING.description, 'string');
};
