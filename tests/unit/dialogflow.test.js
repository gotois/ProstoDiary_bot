module.exports = (t) => {
  const { formatQuery } = require('../../src/services/dialog.service');
  t.is(typeof formatQuery, 'function');

  // spaces
  t.is(formatQuery('  text '), 'text');
  t.is(formatQuery('  some'), 'some');

  // dot
  t.is(formatQuery('.5'), '0.5');
  t.is(formatQuery('1.5'), '1.5');
  t.is(formatQuery('.1 .2 .3'), '0.1 0.2 0.3');
  t.is(formatQuery('some .5'), 'some 0.5');

  // full
  t.is(formatQuery(' Мороженное .3 руб'), 'Мороженное 0.3 руб');
};
