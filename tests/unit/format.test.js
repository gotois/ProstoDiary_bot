module.exports = (t) => {
  const {
    previousInput,
    formatRows,
  } = require('../../src/services/format.service');
  t.is(previousInput('Some'), 'Some…');
  t.is(previousInput('123456789'), '123456…');
  // formatRows
  {
    t.is(
      formatRows([
        {
          date: new Date(0),
          text: 'qqq',
        },
      ]),
      '01.01.1970\nqqq',
    );
    t.is(
      formatRows([
        {
          date: new Date(0),
          text: '+++',
        },
      ]),
      '01.01.1970\n+++',
    );
    t.is(
      formatRows([
        {
          date: new Date('01.01.1991'),
          text: 'some1',
        },
        {
          date: new Date('01.01.1992'),
          text: 'some2',
        },
      ]),
      '01.01.1991\nsome1\n\n01.01.1992\nsome2',
    );
  }
};
