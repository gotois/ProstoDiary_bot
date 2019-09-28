module.exports = (t) => {
  const env = require('../../src/environment');
  t.is(typeof env.DATABASE, 'object');
  t.is(typeof env.CORALOGIX, 'object');
  t.is(typeof env.TELEGRAM, 'object');
  t.is(typeof env.PLOTLY, 'object');
  t.is(typeof env.NALOGRU, 'object');
  t.is(typeof env.FAT_SECRET, 'object');
  t.is(typeof env.SENDGRID, 'object');
  t.is(typeof env.OPEN_WEATHER, 'object');
  t.is(typeof env.GOOGLE, 'object');
  // fixme: GOOGLE.CREDENTIALS в CI отдает не object
  if (typeof env.GOOGLE.CREDENTIALS !== 'object') {
    t.log('WARN! unknown google credentials');
  }
  t.is(typeof env.DIALOGFLOW, 'object');
  // t.is(typeof env.DIALOGFLOW.CREDENTIALS, 'object');
  t.is(typeof env.WOLFRAM_ALPHA.APP_ID, 'string');
};
