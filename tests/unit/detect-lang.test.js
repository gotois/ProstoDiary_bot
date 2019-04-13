module.exports = (t) => {
  const {
    detectLang,
    getPostgresLangCode,
    getDialogFlowLangCodeFromQuery,
    languages,
  } = require('../../src/services/detect-language.service');
  const engText1 = detectLang('Are you ready?');
  t.is(engText1, languages.ENG);

  const rusText1 = detectLang('Как твои дела');
  t.is(rusText1, languages.RUS);

  const rusText2 = detectLang('поел омлет');
  t.is(rusText2, languages.RUS);

  const rusText3 = detectLang('поел яйцо');
  t.is(rusText3, languages.RUS);

  const undText = detectLang('123123132');
  t.is(undText, languages.UNDEFINED);

  const ruTestFromQuery = getDialogFlowLangCodeFromQuery('привет мир');
  t.is(ruTestFromQuery, 'ru');

  const enTestFromQuery = getDialogFlowLangCodeFromQuery('hello world');
  t.is(enTestFromQuery, 'en');

  const rusPostgresQuery = getPostgresLangCode('привет мир');
  t.is(rusPostgresQuery, 'russian');

  const engPostgresQuery = getPostgresLangCode('Hello world');
  t.is(engPostgresQuery, 'english');

  const undPostgresQuery = getPostgresLangCode('123123123123');
  t.is(undPostgresQuery, 'simple');
};
