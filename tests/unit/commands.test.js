// TODO: это перевести в e2e тесты
module.exports = (t) => {
  const commands = require('../../src/bot/commands');
  const {
    PING,
    BACKUP,
    DBCLEAR,
    START,
    HELP,
    GET,
    GETTODAY,
    SET,
    GRAPH,
    COUNT,
    SEARCH,
    EDITED_MESSAGE_TEXT,
    TEXT,
    LOCATION,
    VERSION,
  } = commands;

  t.true(BACKUP.alias instanceof RegExp);
  t.true(DBCLEAR.alias instanceof RegExp);
  t.true(GETTODAY.alias instanceof RegExp);
  t.true(START.alias instanceof RegExp);
  t.true(HELP.alias instanceof RegExp);
  t.true(GET.alias instanceof RegExp);
  t.true(SET.alias instanceof RegExp);
  t.true(GRAPH.alias instanceof RegExp);
  t.true(COUNT.alias instanceof RegExp);
  t.true(SEARCH.alias instanceof RegExp);
  t.true(VERSION.alias instanceof RegExp);
  t.true(typeof EDITED_MESSAGE_TEXT.alias === 'string');
  t.true(typeof TEXT.alias === 'string');
  t.true(typeof LOCATION.alias === 'string');

  t.true(SET.alias.test('/set 2018-03-18 something'));
  t.false(SET.alias.test('/set something'));

  t.true(GETTODAY.alias.test('/get today'));
  t.false(GETTODAY.alias.test('/get тудей'));

  t.true(GET.alias.test('/get 2018-03-18'));
  t.false(GET.alias.test('/get something'));

  t.true(BACKUP.alias.test('/backup'));
  t.false(BACKUP.alias.test('/backup 1'));

  t.true(DBCLEAR.alias.test('/dbclear'));
  t.false(DBCLEAR.alias.test('/dbclear/'));

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
