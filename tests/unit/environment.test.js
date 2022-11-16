module.exports = (t) => {
  const environment = require('../../src/environment');
  t.is(typeof environment.DATABASE, 'object');
  t.is(typeof environment.CORALOGIX, 'object');
  t.is(typeof environment.TELEGRAM, 'object');
  t.is(typeof environment.SENDGRID, 'object');
  t.true(
    environment.DATABASE.POSTGRES_CONNECTION_STRING.startsWith('postgres://'),
  );
  t.false(
    environment.DATABASE.POSTGRES_CONNECTION_STRING.includes('undefined'),
  );
};
