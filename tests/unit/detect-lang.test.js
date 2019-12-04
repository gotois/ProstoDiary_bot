module.exports = (t) => {
  const {
    detectLang,
    languages,
    isRUS,
    isENG,
    langISO,
  } = require('../../src/services/nlp.service');
  t.true(isRUS('rus'));
  t.false(isRUS('eng'));
  t.true(isENG('eng'));
  t.false(isENG('abc'));
  t.is(langISO('rus'), 'ru');
  t.is(langISO('eng'), 'en');

  const engText1 = detectLang('Are you ready?').language;
  t.is(engText1, languages.ENG);

  const rusText1 = detectLang('Как твои дела').language;
  t.is(rusText1, languages.RUS);

  const rusText2 = detectLang('поел омлет').language;
  t.is(rusText2, languages.RUS);

  const rusText3 = detectLang('поел яйцо').language;
  t.is(rusText3, languages.RUS);

  const undText = detectLang('123123132').language;
  t.is(undText, languages.UNDEFINED);

  const ruTestFromQuery = detectLang('привет мир').dialogflow;
  t.is(ruTestFromQuery, 'ru');

  const enTestFromQuery = detectLang('hello world').dialogflow;
  t.is(enTestFromQuery, 'en');

  const rusPostgresQuery = detectLang('привет мир').postgresql;
  t.is(rusPostgresQuery, 'russian');

  const engPostgresQuery = detectLang('Hello world').postgresql;
  t.is(engPostgresQuery, 'english');

  const undPostgresQuery = detectLang('123123123123').postgresql;
  t.is(undPostgresQuery, 'simple');
};
