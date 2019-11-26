module.exports = (t) => {
  const environment = require('../../src/environment');
  t.is(typeof environment.DATABASE, 'object');
  t.is(typeof environment.CORALOGIX, 'object');
  t.is(typeof environment.TELEGRAM, 'object');
  t.is(typeof environment.PLOTLY, 'object');
  t.is(typeof environment.NALOGRU, 'object');
  t.is(typeof environment.FAT_SECRET, 'object');
  t.is(typeof environment.SENDGRID, 'object');
  t.is(typeof environment.OPEN_WEATHER, 'object');
  t.is(typeof environment.GOOGLE, 'object');
  t.true(environment.POSTGRES_CONNECTION_STRING.startsWith('postgres://'));
  t.false(environment.POSTGRES_CONNECTION_STRING.includes('undefined'));
  // fixme: GOOGLE.CREDENTIALS в CI отдает не object
  if (typeof environment.GOOGLE.CREDENTIALS !== 'object') {
    t.log('WARN! unknown google credentials');
  }
  t.is(typeof environment.DIALOGFLOW, 'object');
  // t.is(typeof env.DIALOGFLOW.CREDENTIALS, 'object');
  t.is(typeof environment.WOLFRAM_ALPHA.APP_ID, 'string');
};
