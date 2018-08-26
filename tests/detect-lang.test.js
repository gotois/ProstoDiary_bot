module.exports = t => {
  const {detectLang, languages} = require('../src/services/detect-language.service');
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
  
  t.pass();
};
