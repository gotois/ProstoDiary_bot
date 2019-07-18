module.exports = (t) => {
  const {
    previousInput,
    formatRows,
  } = require('../../src/services/format.service');
  t.is(previousInput('Some'), 'Some…✓');
  t.is(previousInput('123456789'), '123456…✓');
  // formatRows
  {
    t.is(
      formatRows([
        {
          date_added: new Date(0),
          entry: 'qqq',
        },
      ]),
      '01.01.1970\nqqq',
    );
    t.is(
      formatRows([
        {
          date_added: new Date(0),
          entry: '+++',
        },
      ]),
      '01.01.1970\n+++',
    );
    t.is(
      formatRows([
        {
          date_added: new Date('01.01.1991'),
          entry: 'some1',
        },
        {
          date_added: new Date('01.01.1992'),
          entry: 'some2',
        },
      ]),
      '01.01.1991\nsome1\n\n01.01.1992\nsome2',
    );
  }
};
