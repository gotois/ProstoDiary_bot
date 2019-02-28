module.exports = (t) => {
  const session = require('../../src/services/session.service');
  t.is(typeof session.getSession(123), 'object');
  t.is(typeof session.getSession(123).id, 'number');
};
