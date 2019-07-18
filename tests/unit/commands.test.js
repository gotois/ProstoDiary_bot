module.exports = (t) => {
  const commands = require('../../src/commands');
  const {
    PING,
    BACKUP,
    DB_CLEAR,
    START,
    HELP,
    GET_DATE,
    GET_TODAY,
    SET_DATE,
    GRAPH,
    COUNT,
    SEARCH,
    EDITED_MESSAGE_TEXT,
    TEXT,
    LOCATION,
    VERSION,
  } = commands;

  t.true(BACKUP.alias instanceof RegExp);
  t.true(DB_CLEAR.alias instanceof RegExp);
  t.true(GET_TODAY.alias instanceof RegExp);
  t.true(START.alias instanceof RegExp);
  t.true(HELP.alias instanceof RegExp);
  t.true(GET_DATE.alias instanceof RegExp);
  t.true(SET_DATE.alias instanceof RegExp);
  t.true(GRAPH.alias instanceof RegExp);
  t.true(COUNT.alias instanceof RegExp);
  t.true(SEARCH.alias instanceof RegExp);
  t.true(VERSION.alias instanceof RegExp);
  t.true(typeof EDITED_MESSAGE_TEXT.alias === 'string');
  t.true(typeof TEXT.alias === 'string');
  t.true(typeof LOCATION.alias === 'string');

  t.true(SET_DATE.alias.test('/set 2018-03-18 something'));
  t.false(SET_DATE.alias.test('/set something'));

  t.true(GET_TODAY.alias.test('/get today'));
  t.false(GET_TODAY.alias.test('/get тудей'));

  t.true(GET_DATE.alias.test('/get 2018-03-18'));
  t.false(GET_DATE.alias.test('/get something'));

  t.true(BACKUP.alias.test('/backup'));
  t.false(BACKUP.alias.test('/backup 1'));

  t.true(DB_CLEAR.alias.test('/dbclear'));
  t.false(DB_CLEAR.alias.test('/dbclear/'));

  t.true(COUNT.alias.test('/count'));
  t.true(COUNT.alias.test('/count +'));
  t.true(COUNT.alias.test('/count -'));
  t.false(COUNT.alias.test('/count/'));
  t.false(COUNT.alias.test('/count-'));
  t.false(COUNT.alias.test('/count+'));

  t.true(SEARCH.alias.test('/search something'));

  t.true(LOCATION.alias === 'location');

  t.true(VERSION.alias.test('/version'));
  t.is(typeof PING.description, 'string');
};
