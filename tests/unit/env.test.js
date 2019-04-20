module.exports = (t) => {
  const env = require('../../src/env');
  t.is(typeof env.DATABASE, 'object');
  t.is(typeof env.CORALOGIX, 'object');
  t.is(typeof env.TELEGRAM, 'object');
  t.true(env.TELEGRAM.WEB_HOOK_URL.startsWith('https'));
  t.is(typeof env.PLOTLY, 'object');
  t.is(typeof env.NALOGRU, 'object');
  t.is(typeof env.FAT_SECRET, 'object');
  t.is(typeof env.SENDGRID, 'object');
  t.is(typeof env.OPEN_WEATHER, 'object');
  t.is(typeof env.GOOGLE, 'object');
  t.throws(() => {
    env.GOOGLE.GOOGLE_CREDENTIALS_PARSED;
  });
  t.is(typeof env.DIALOGFLOW, 'object');
  t.throws(() => {
    env.DIALOGFLOW.DIALOGFLOW_CREDENTIALS;
  });
};
