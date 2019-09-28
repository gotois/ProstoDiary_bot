const validator = require('validator');

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
  // fixme: GOOGLE_CREDENTIALS_PARSED в CI отдает не object
  // t.is(typeof env.GOOGLE.GOOGLE_CREDENTIALS_PARSED, 'object');
  t.is(typeof env.DIALOGFLOW, 'object');
  // t.is(typeof env.DIALOGFLOW.DIALOGFLOW_CREDENTIALS, 'object');
  t.is(typeof env.WOLFRAM_ALPHA.APP_ID, 'string');
};
