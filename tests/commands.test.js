module.exports = t => {
  const commands = require('../src/commands');
  const {
    DOWNLOAD,
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
  } = commands;

  t.true(DOWNLOAD instanceof RegExp);
  t.true(DB_CLEAR instanceof RegExp);
  t.true(GET_TODAY instanceof RegExp);
  t.true(START instanceof RegExp);
  t.true(HELP instanceof RegExp);
  t.true(GET_DATE instanceof RegExp);
  t.true(SET_DATE instanceof RegExp);
  t.true(GRAPH instanceof RegExp);
  t.true(COUNT instanceof RegExp);
  t.true(SEARCH instanceof RegExp);
  t.true(typeof EDITED_MESSAGE_TEXT === 'string');
  t.true(typeof TEXT === 'string');

  {
    t.true(DOWNLOAD.test('/download'));
    t.false(DOWNLOAD.test('/download 1'));
  }
  {
    t.true(DB_CLEAR.test('/dbclear'));
    t.false(DB_CLEAR.test('/dbclear/'));
  }
  {
    t.true(COUNT.test('/count'));
    t.true(COUNT.test('/count +'));
    t.true(COUNT.test('/count -'));
    t.false(COUNT.test('/count/'));
  }
  {
    t.true(SEARCH.test('/search something'));
  }
};
