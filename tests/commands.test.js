module.exports = t => {
  const commands = require('../src/commands');
  const {
    DOWNLOAD,
    DBCLEAR,
    START,
    HELP,
    GETDATE,
    SETDATE,
    GRAPH,
    COUNT,
    SEARCH,
    EDITED_MESSAGE_TEXT,
    TEXT,
  } = commands;

  t.true(DOWNLOAD instanceof RegExp);
  t.true(DBCLEAR instanceof RegExp);
  t.true(START instanceof RegExp);
  t.true(HELP instanceof RegExp);
  t.true(GETDATE instanceof RegExp);
  t.true(SETDATE instanceof RegExp);
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
    t.true(DBCLEAR.test('/dbclear'));
    t.false(DBCLEAR.test('/dbclear/'));
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
